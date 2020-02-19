# frozen_string_literal: true

source 'https://rubygems.org'
ruby '~> 2.6'

# Frameworks
gem 'rails', '5.2.3'

# Operations
gem 'puma', '3.12.2'
gem 'puma_worker_killer', '~> 0.1'

# Queuing
gem 'sidekiq', '~> 5.2'
gem 'sidekiq-cron', '~> 1.0'
gem 'sidekiq-unique-jobs', '~> 5.0'
gem 'sidekiq-worker-killer', '~> 0.3.0'

# Assets and Views
gem 'bourbon', '~> 3.2'
gem 'jbuilder', '~> 2.9'
gem 'neat', '~> 1.5.1'
gem 'premailer-rails', '~> 1.10.3'
gem 'rack-pjax', '~> 1.1'
gem 'sass-rails', '~> 5.1'
# gem 'therubyracer', '< 13'
gem 'uglifier', '~> 4.1'

# Database
gem 'pg', '1.1.4'

# API clients
gem 'analytics-ruby', '~> 2.0', require: 'segment/analytics'
gem 'aws-sdk-s3', '~> 1.0'
gem 'octokit', '~> 4.14'
gem 'omniauth', '~> 1.9'
gem 'omniauth-github', '~> 1.3'
gem 'pusher', '~> 1.3'
gem 'splitclient-rb', '~> 7.0.2'
gem 'stripe', '~> 4.24'

# Health
gem 'honeybadger', '~> 4.5', require: ENV['ON_PREM'] != 'true'
gem 'rails-assets-honeybadger', '~> 5.0', require: ENV['ON_PREM'] != 'true', source: 'https://rails-assets.org'

# Static Pages
gem 'high_voltage', '~> 3.1'

# Libraries
gem 'attr_encrypted', '~> 3.1'
gem 'bcrypt', '~> 3.1'
gem 'color', '~> 1.8'
gem 'linkety', '~> 0.1'
gem 'ping', '~> 0.1.0'
gem 'pundit', '~> 2.1'
gem 'redis', '~> 4.0'
gem 'virtus', '~> 1.0'
gem 'will_paginate', '~> 3.1'
gem 'wisper', '~> 1.6'

# Rendering
gem 'commonmarker', '~> 0.20' # MarkdownFilter
gem 'email_reply_parser', '~> 0.5' # EmailReplyFilter
gem 'escape_utils', '~> 1.2'
gem 'gemoji', '~> 3.0.1' # EmojiFilter
gem 'github-linguist', '~> 7.6' # SyntaxHighlightFilter
gem 'html-pipeline', '~> 2.12'
gem 'html-pipeline-issue_references', '~> 1.0'
gem 'html-pipeline-linkify_github', '~> 1.0.2'
gem 'octicons_helper', '~> 8.5'
gem 'rinku', '~> 1.7' # AutolinkFilter
gem 'sanitize', '~> 4.6' # SanitizationFilter
gem 'task_list', '~> 1.0.2'

# load after will_paginate
gem 'elasticsearch', '~> 6.8'
gem 'elasticsearch-model', '~> 6.1'
gem 'elasticsearch-rails', '~> 6.1'

# perf
gem 'flamegraph', '~> 0.9'
gem 'memory_profiler', '~> 0.9'
gem 'rack-mini-profiler', '1.0', require: false
gem 'stackprof', '~> 0.2'

group :development, :test do
  gem 'byebug', '~> 11.0'
  gem 'listen', '~> 3.1.5'
  gem 'spring', '~> 2.1'
  gem 'spring-watcher-listen', '~> 2.0.0'
end

group :development do
  gem 'database_cleaner', '~> 1.7'
  gem 'derailed_benchmarks', '~> 1.3'
  gem 'rails_real_favicon', '~> 0.0'
  gem 'web-console', '~> 3.7.0'
end

group :test do
  gem 'fabrication', '~> 2.20'
  gem 'faker', '~> 1.9'
  gem 'guard-minitest', '~> 2.4'
  gem 'guard-rubocop', '~> 1.3'
  gem 'minitest', '~> 5.11' # latest usable version until rails 5.2.3
  gem 'minitest-ci', '~> 3.4'
  gem 'minitest-rails-capybara', '~> 3.0'
  gem 'mocha', '~> 1.8'
  gem 'rubocop', '0.64', require: false
  gem 'shoulda', '~> 3.6'
  gem 'simplecov', '~> 0.16', require: false
  gem 'stripe-ruby-mock', '~> 2.0'
  gem 'timecop', '~> 0.7'
  gem 'webmock', '~> 3.5'
end
