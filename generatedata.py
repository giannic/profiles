import datetime, time
from datetime import timedelta
import random
import json

now = datetime.datetime.now()
start_of_time = now - timedelta(365) # one year ago from now


def main():
	sites = ["Facebook", "Twitter", "LinkedIn", "Pinterest", "Tumblr", "Spotify", "LastFM"]
	data = {site: generate_times() for site in sites}

	# prints the number of visits for Facebook
	'''
	print len(data["Facebook"]["open"])
	print len(data["Facebook"]["close"])
	'''

	# prints the duration of each visit to Facebook in H:M:S 
	'''
	for start, end in zip(data["Facebook"]["open"], data["Facebook"]["close"]):
		print str(timedelta(seconds=end - start))
	'''

	print data["Facebook"]["open"][:4]
	print data["Facebook"]["close"][:4]

	with open('usage_data.json', 'w') as outfile:
		json.dump(data, outfile)


def generate_times():
	t = start_of_time
	open_times = []
	close_times = []
	# from the beginning of data collection to now, randomly decides:
	# 	a) length of visit
	# 	b) time to next visit
	# and records open/close times in arrays, returning as a dict
	while t < now:
		open_times.append(time.mktime(t.timetuple()))
		t += random_timedelta(10, 3600 * 2) # assume 10 seconds to 2 hours spent on site
		close_times.append(time.mktime(t.timetuple()))
		t += random_timedelta(10, 3600 * 9)	# assume next access is between 10 seconds and 9 hours later

	return {"open": open_times, "close": close_times}

def random_timedelta(lower, upper):
	'''Returns a timedelta in seconds between lower and upper'''
	return timedelta(0, random.randint(lower, upper))

if __name__ == "__main__":
    main()