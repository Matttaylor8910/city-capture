#!/usr/bin/env ruby

# Adds all predetermined locations to the firebase db

require 'firebase'
require 'json'

firebase = Firebase::Client.new 'https://torrid-fire-239.firebaseio.com/'
# firebase = Firebase::Client.new 'https://city-capture-beta.firebaseio.com/'

locations = JSON.parse(File.read('locations.json'))

locations['locations'].each do |l|
  firebase.push('locations', l)
end
