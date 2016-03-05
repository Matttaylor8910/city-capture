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
# each game has a random subset of locations.
def random_locations
  hsh_to_a(firebase.get('locations').body).sample(5)
end

# returns a random name for a game
# for now, we are boring
def random_name
  "Game #{rand 1000}"
end

# maintain games
Thread.new do
  loop do
    # check if any games are present; if there aren't, we probably just started
    if games.empty?
      # start a one minute game
      # TODO: make this one hour
      firebase.push('games', startTime: Time.now.to_i,
                             endTime: Time.now.to_i + 60,
                             locations: random_locations,
                             orangeTeam: [],
                             blueTeam: [],
                             orangeScore: 0,
                             blueScore: 0,
                             name: random_name)

      # start a five minute game
      # TODO: make this six hours
      firebase.push('games', startTime: Time.now.to_i,
                             endTime: Time.now.to_i + 60,
                             locations: random_locations,
                             orangeTeam: [],
                             blueTeam: [],
                             orangeScore: 0,
                             blueScore: 0,
                             name: random_name)
    end

    # end games that are over
    ended = games_raw.select { |_id, g| Time.now.to_i > g['endTime'] }
    ended.each do |id, g|
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
                             orangeScore: 0,
                             blueScore: 0,
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

# redirect to index
get '/' do
  redirect 'index.html'
end

namespace '/v1' do
  post '/add/user/:name' do |name|
    add_user name
  end
end
