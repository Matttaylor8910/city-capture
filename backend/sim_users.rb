#!/usr/bin/env ruby

# Simulates n users using City Capture
# Users perform random actions like joining and leaving games, and moving

require 'json'
require 'net/http'

n = ARGV[0].to_i
threads = []

names = File.readlines('user_names').sample(n).map!(&:chomp)

# auto flush
STDOUT.sync = true

n.times do |idx|
  threads << Thread.new do
    name = names[idx]
    puts "#{idx}: Creating user #{name}"

    # add user
    uri = URI "http://cc.butthole.tv/v1/users/add/#{name}"
    req = Net::HTTP::Post.new(uri)
    Net::HTTP.start(uri.hostname, uri.port) do |http|
      http.request(req)
    end

    # use the product
    loop do
      games = JSON.parse Net::HTTP.get('cc.butthole.tv', '/v1/games')

      # filter to upcoming games
      games.keep_if { |g| g['startTime'] > Time.now.to_i }

      # pick a random game to join
      game = games.sample
      if game.nil?
        sleep 5
        next
      end
      team = rand > 0.5 ? 'orange' : 'blue'
      puts "#{idx}: Joining game #{game['id']}"
      uri = URI 'http://cc.butthole.tv/v1/games/join'
      req = Net::HTTP::Post.new(uri)
      req.body = {
        name: name,
        game: game['id'],
        team: team
      }.to_json
      Net::HTTP.start(uri.hostname, uri.port) do |http|
        http.request(req)
      end

      # wait for the game to start, or wait less than that time and leave
      if rand > 0.1
        # chill
        time = game['startTime'] - Time.now.to_i
        puts "#{idx}: Waiting #{time} seconds for game to start"
        sleep time
        puts "#{idx}: Game starting..."

        # game logic
        lat = 0.0
        long = 0.0
        while game['endTime'] > Time.now.to_i + 5
          if rand > 0.9
            # teleport elsewhere
            if rand > 0.5
              # teleport to other location
              location = game['locations'].sample
              lat = location['lat']
              long = location['long']
              puts "#{idx}: Good teleporting to #{lat}, #{long}"
            else
              # teleport random
              lat = rand(180)
              long = rand(180)
              puts "#{idx}: Random teleporting to #{lat}, #{long}"
            end
          end

          uri = URI 'http://cc.butthole.tv/v1/location'
          req = Net::HTTP::Post.new(uri)
          req.body = {
            game: game['id'],
            team: team,
            lat: lat,
            long: long
          }.to_json
          Net::HTTP.start(uri.hostname, uri.port) do |http|
            http.request(req)
          end

          sleep 5
        end
        puts "#{idx}: Game #{game['id']} ended"
      else
        # leave after some time
        time = rand(game['startTime'] - Time.now.to_i)
        puts "#{idx}: Waiting #{time} seconds to leave game"
        sleep time
        uri = URI 'http://cc.butthole.tv/v1/games/leave'
        req = Net::HTTP::Post.new(uri)
        req.body = {
          name: name,
          game: game['id'],
          team: team
        }.to_json
        Net::HTTP.start(uri.hostname, uri.port) do |http|
          http.request(req)
        end
        puts "#{idx}: Leaving game..."
      end

      # chill
      sleep 5
    end
  end
end

threads.each(&:join)
