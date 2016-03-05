#!/usr/bin/env ruby

require 'json'
require 'firebase'
require 'sinatra'
require 'sinatra/cross_origin'
require 'sinatra/json'
require 'sinatra/namespace'
require 'sinatra/reloader'

# returns a firebase object so we don't have to type this fucking url 50
# million times over the weekend
def firebase
  Firebase::Client.new 'https://torrid-fire-239.firebaseio.com/'
  # Firebase::Client.new 'https://city-capture-beta.firebaseio.com/'
end

# converts a hash to an array where each key is an index
# useful for handling firebase's lack of arrays)
def hsh_to_a(hsh)
  return [] if hsh.nil?
  hsh.collect { |_key, value| value }
end

# returns a list of ongoing games
# also adds an id key to each element in the array where id = firebases' UID
def games
  raw = games_raw
  return [] if raw.nil?
  raw.each_key do |key|
    # add id with old key
    raw[key]['id'] = key

    # instantiate teams if they were nil
    raw[key]['orangeTeam'] ||= []
    raw[key]['blueTeam'] ||= []
  end
  hsh_to_a(raw)
end

# returns the raw games firebase hash
def games_raw
  firebase.get('games').body
end

# returns a list of users
def users
  hsh_to_a(firebase.get('users').body)
end

# returns a list of locations
def locations
  hsh_to_a(firebase.get('locations').body)
end

# adds a user to the firebase
def add_user(name)
  # return conflict if there is a conflict
  return 409 if users.any? { |u| u['name'].casecmp(name) == 0 }

  # else return OK
  firebase.push('users', name: name)
  200
end

# returns a random subset of the locations available
# each game has a random subset of locations
# this function also adds score values to the objects to ready them for a game
def random_locations
  locations = hsh_to_a(firebase.get('locations').body).sample(5)
  locations.map do |l|
    # production:
    # l['orangeScore'] = 0
    # l['blueScore'] = 0
    # debug:
    r = rand
    if r > 0.6
      l['orangeScore'] = rand(1000)
      l['blueScore'] = 0
    elsif r > 0.3
      l['orangeScore'] = 0
      l['blueScore'] = rand(1000)
    else
      l['orangeScore'] = 0
      l['blueScore'] = 0
    end
  end
  locations
end

# returns a random name for a game
# for now, we are boring
def random_name
  File.readlines('names').sample.chomp
end

# debug function to generate a list of random fake users
def random_team
  Array.new(rand(20)) { "User #{rand(100)}" }
end

# returns the distance between two lat/long tuples
# thanks stackoverflow
def distance(loc1, loc2)
  rad_per_deg = Math::PI / 180 # PI / 180
  rm = 6_371_000 # Radius in meters

  dlat_rad = (loc2[0] - loc1[0]) * rad_per_deg # Delta, converted to rad
  dlon_rad = (loc2[1] - loc1[1]) * rad_per_deg

  lat1_rad = loc1[0] * rad_per_deg
  lat2_rad = loc2[0] * rad_per_deg

  a = Math.sin(dlat_rad / 2)**2 + Math.cos(lat1_rad) * Math.cos(lat2_rad) *
                                  Math.sin(dlon_rad / 2)**2
  c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  rm * c # Delta in meters
end

# kill the baby threads in the case that we just reloaded
Thread.list.each do |t|
  begin
    puts "killing #{t}"
    Thread.kill(t) unless t == Thread.current || t == Thread.main
  rescue SystemExit
    puts 'bro chill'
  end
end

# worth a shot?
sleep 1

# maintain games
Thread.new do
  loop do
    # check if any games are present; if there aren't, we probably just started
    if games.empty?
      puts 'games is empty o no'
      # start a thirty minute game
      # TODO: make this one hour and remove random teams
      firebase.push('games', startTime: Time.now.to_i,
                             endTime: Time.now.to_i + 1800,
                             locations: random_locations,
                             orangeTeam: random_team,
                             blueTeam: random_team,
                             name: random_name)

      # start a fifteen minute game
      # TODO: make this six hours and remove random teams
      firebase.push('games', startTime: Time.now.to_i,
                             endTime: Time.now.to_i + 900,
                             locations: random_locations,
                             orangeTeam: random_team,
                             blueTeam: random_team,
                             name: random_name)
    end

    # end games that are over
    ended = games.select { |g| Time.now.to_i > g['endTime'] }
    ended.each do |g|
      puts "removing #{g['id']}"
      # remove the game from the db
      # TODO: calc some stats here
      firebase.delete "games/#{g['id']}"

      # create a new game with the same length that will start in five minutes
      # TODO: make this fifteen minutes
      firebase.push('games', endTime: Time.now.to_i +
                               (g['endTime'] - g['startTime']) + 300,
                             startTime: Time.now.to_i + 300,
                             locations: random_locations,
                             orangeTeam: random_team,
                             blueTeam: random_team,
                             name: random_name)
    end

    # protect the cpu
    sleep 1
    puts 'checkin shit'
    STDOUT.flush
  end
end

configure do
  # custom port for custom shit
  set :port, 4545
  # app
  set :public_folder, '../app/www'
  set :protection, except: [:json_csrf]
  enable :static
  enable :cross_origin
end

# redirect to index
get '/' do
  redirect 'index.html'
end

# CORS
options "*" do
  response.headers["Allow"] = "HEAD,GET,PUT,DELETE,OPTIONS"

  # Needed for AngularJS
  response.headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Cache-Control, Accept"

  200
end

# client api
namespace '/v1' do
  get '/games' do
    json games
  end

  post '/location' do
    body = JSON.parse request.body.read
    team = body['team']
    game = games_raw[body['game']]
    loc = body['lat'], body['long']

    game['locations'].each_with_index do |l, idx|
      dist = distance([l['lat'], l['long']], loc)
      puts "Distance from #{l['name']}: #{dist}m"
      # increment score if we are close
      next unless dist < 15
      s = firebase.get("games/#{body['game']}/locations/#{idx}/#{team}Score")
          .body
      firebase.update("games/#{body['game']}/locations/#{idx}",
                      "#{team}Score": s + 1)
    end

    200
  end

  post '/users/add/:name' do |name|
    add_user name
  end

  post '/games/join' do
    body = JSON.parse request.body.read
    name = body['name']
    game = body['game']
    team = body['team'] + 'Team'

    firebase.push("games/#{game}/#{team}", name)

    200
  end

  post '/games/leave' do
    body = JSON.parse request.body.read
    name = body['name']
    game = body['game']
    team = body['team'] + 'Team'

    # find the key to remove
    key = games_raw[game][team].key(name)
    firebase.delete "games/#{game}/#{team}/#{key}"

    200
  end
end
