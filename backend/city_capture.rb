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
def games
  hsh_to_a(games_raw)
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
  "Game #{rand 1000}"
end

# returns the distance between two lat/long tuples
# thanks stackoverflow
def distance(loc1, loc2)
  rad_per_deg = Math::PI / 180 # PI / 180
  rm = 6_371_000 # Radius in meters

  dlat_rad = (loc2[0] - loc1[0]) * rad_per_deg # Delta, converted to rad
  dlon_rad = (loc2[1] - loc1[1]) * rad_per_deg

  lat1_rad = loc1.map { |i| i * rad_per_deg }
  lat2_rad = loc2.map { |i| i * rad_per_deg }

  a = Math.sin(dlat_rad / 2)**2 + Math.cos(lat1_rad) * Math.cos(lat2_rad) *
                                  Math.sin(dlon_rad / 2)**2
  c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  rm * c # Delta in meters
end

# save my butthole
Thread.abort_on_exception = true

# kill the baby threads in the case that we just reloaded
Thread.list.each do |thread|
  thread.exit unless thread == Thread.current
end

# maintain games
Thread.new do
  loop do
    # check if any games are present; if there aren't, we probably just started
    if games.empty?
      puts 'games is empty o no'
      # start a one minute game
      # TODO: make this one hour
      firebase.push('games', startTime: Time.now.to_i,
                             endTime: Time.now.to_i + 60,
                             locations: random_locations,
                             orangeTeam: [],
                             blueTeam: [],
                             name: random_name)

      # start a five minute game
      # TODO: make this six hours
      firebase.push('games', startTime: Time.now.to_i,
                             endTime: Time.now.to_i + 300,
                             locations: random_locations,
                             orangeTeam: [],
                             blueTeam: [],
                             name: random_name)
    end

    # end games that are over
    ended = games_raw.select { |_id, g| Time.now.to_i > g['endTime'] }
    ended.each do |id, g|
      puts "removing #{id}"
      # remove the game from the db
      # TODO: calc some stats here
      firebase.delete "games/#{id}"

      # create a new game with the same length
      firebase.push('games', endTime: Time.now.to_i +
                               (g['endTime'] - g['startTime']),
                             startTime: Time.now.to_i,
                             locations: random_locations,
                             orangeTeam: [],
                             blueTeam: [],
                             name: random_name)
    end

    # protect the cpu
    sleep 1
    puts 'checkin shit'
  end
end

# custom port for custom shit
set :port, 4545
# app
set :public_folder, '../app/www'
enable :static
enable :cross_origin

# redirect to index
get '/' do
  redirect 'index.html'
end

# client api
namespace '/v1' do
  get '/games' do
    # Not implemented
    501
  end

  post '/location' do
    body = JSON.parse request.body.read

    # Not implemented
    501
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
