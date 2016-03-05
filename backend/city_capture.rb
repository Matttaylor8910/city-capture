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
def database
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
  firebase = database
  firebase.get 'games'
end

# returns a list of users
def users
  firebase = database
  firebase.get 'users'
end

# returns a list of locations
def locations
  firebase = database
  firebase.get 'locations'
end 

# adds a user to the database
def add_user(name)
  firebase = database
  users = hsh_to_a(firebase.get('users').body)

  # return conflict if there is a conflict
  return 409 if users.any? { |u| u['name'].casecmp(name) == 0 }

  # else return OK
  firebase.push('users', name: name)
  200
end

