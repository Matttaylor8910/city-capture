#!/usr/bin/env ruby

require 'json'
require 'firebase'
require 'sinatra'
require 'sinatra/cross_origin'
require 'sinatra/json'
require 'sinatra/namespace'

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
    raw[key]['orangeTeam'] = hsh_to_a raw[key]['orangeTeam']
    raw[key]['blueTeam'] = hsh_to_a raw[key]['blueTeam']
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
    l['orangeScore'] = 0
    l['blueScore'] = 0
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

# maintain games
Thread.new do
  loop do
    # check if any games are present; if there aren't, we probably just started
    if games.empty?
      puts 'games is empty o no'
      # TODO: make this one hour and remove random teams
      firebase.push('games', startTime: Time.now.to_i + 60,
                             endTime: Time.now.to_i + 300 + 60,
                             locations: random_locations,
                             orangeTeam: [],
                             blueTeam: [],
                             name: random_name)

      # TODO: make this six hours and remove random teams
      firebase.push('games', startTime: Time.now.to_i + 3600,
                             endTime: Time.now.to_i + 3600 + 60,
                             locations: random_locations,
                             orangeTeam: [],
                             blueTeam: [],
                             name: random_name)
    end

    # end games that are over
    ended = games.select { |g| Time.now.to_i > g['endTime'] }
    ended.each do |g|
      puts "removing #{g['id']}"
      # remove the game from the db
      # TODO: calc some stats here
      firebase.delete "games/#{g['id']}"

      # TODO: make this fifteen minutes between games
      firebase.push('games', endTime: Time.now.to_i +
                               (g['endTime'] - g['startTime']) + 60,
                             startTime: Time.now.to_i + 60,
                             locations: random_locations,
                             orangeTeam: [],
                             blueTeam: [],
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
options '*' do
  response.headers['Allow'] = 'HEAD,GET,PUT,DELETE,OPTIONS'

  # Needed for AngularJS
  response.headers['Access-Control-Allow-Headers'] =
    'X-Requested-With, X-HTTP-Method-Override,\
    Content-Type, Cache-Control, Accept'

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
    puts body

    game['locations'].each_with_index do |l, idx|
      dist = distance([l['lat'], l['long']], loc)

      next unless dist < 15

      # increment score if we are close
      oj = firebase.get("games/#{body['game']}/locations/#{idx}/orangeScore")
           .body
      blue = firebase.get("games/#{body['game']}/locations/#{idx}/blueScore")
             .body
      if team == 'orange'
        if blue > oj
          blue -= 1
        else
          oj += 1
        end
      else
        if oj > blue
          oj -= 1
        else
          blue += 1
        end
      end

      firebase.update("games/#{body['game']}/locations/#{idx}",
                      "#orangeScore": oj)
      firebase.update("games/#{body['game']}/locations/#{idx}",
                      "#blueScore": blue)
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
    game = games_raw[game]
    return 200 if game.nil?
    team = game[team]
    return 200 if team.nil?

    key = team.key(name)
    firebase.delete "games/#{game}/#{team}/#{key}"

    200
  end
end
