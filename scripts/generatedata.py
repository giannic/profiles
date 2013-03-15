import datetime
import time
from datetime import timedelta
import random
import json

now = datetime.datetime.now()
start_of_time = now - timedelta(365)  # one year ago from now
app_id = 0  # unique id of the app


def main():
    sites = ["Facebook", "Twitter", "LinkedIn", "Pinterest", "Tumblr",
             "Spotify", "LastFM", "Behance", "Blogger",
             "Google Plus", "Instagram", "Livejournal",
             "Myspace", "Orkut", "Picasa",
             "Vimeo", "Youtube", "Stumbleupon",
             "RSS"]

    data = {site: generate_times() for site in sites}

    '''
    for site in data:
        print "%s: %d" % (site, len(data[site]["open"]))
    '''

    data = add_variance(data)
    data = add_categories(data)
    data = add_images(data)
    data = add_id(data)
    data = add_url(data)

    '''
    print "\n\nafter variance"

    for site in data:
        print "%s: %d" % (site, len(data[site]["open"]))
    '''

    # print_stuff(data)

    with open('usage_data.json', 'w') as outfile:
        json.dump(data, outfile)


def add_variance(data):
    '''Makes some apps less frequently used.
    Removes some intermittent and last few sessions.
    This should result in shorter duration, with a longer "last used" date'''
    #keys = data.keys()
    # for i in xrange(0, len(keys), 3):

    # for every site
    for site in data:
        app_data = data[site]
        # remove every nth element
        n = random.randint(3, 20)
        new_open = []
        new_close = []
        old_open = app_data["open"]
        old_close = app_data["close"]
        for j in xrange(len(old_open)):
            if j % n != 0:
                new_open.append(old_open[j])
                new_close.append(old_close[j])

        # remove last k elements to simulate apps you no longer use
        k = random.randint(1, 100)
        for _ in xrange(k):
            new_open.pop()
            new_close.pop()

        app_data["open"] = new_open
        app_data["close"] = new_close

    return data


def print_stuff(data):
    # prints the number of visits for Facebook
    print len(data["Facebook"]["open"])
    print len(data["Facebook"]["close"])

    # prints the duration of each visit to Facebook in H:M:S
    for start, end in zip(data["Facebook"]["open"], data["Facebook"]["close"]):
        print str(timedelta(seconds=end - start))


def add_images(data):

    data['Facebook']['img'] = 'img/facebook.png'
    data['Twitter']['img'] = 'img/twitter.png'
    data['LinkedIn']['img'] = 'img/linkedin.png'
    data['Pinterest']['img'] = 'img/pinterest.png'
    data['Tumblr']['img'] = 'img/tumblr.png'
    data['Spotify']['img'] = 'img/spotify.png'
    data['LastFM']['img'] = 'img/lastfm.png'
    data['Behance']['img'] = 'img/behance.png'
    data['Blogger']['img'] = 'img/blogger.png'
    data['Google Plus']['img'] = 'img/googleplus-revised.png'
    data['Instagram']['img'] = 'img/instagram.png'
    data['Livejournal']['img'] = 'img/livejournal.png'
    data['Myspace']['img'] = 'img/myspace.png'
    data['Orkut']['img'] = 'img/orkut.png'
    data['Picasa']['img'] = 'img/picasa.png'
    data['Vimeo']['img'] = 'img/vimeo.png'
    data['Youtube']['img'] = 'img/youtube.png'
    data['Stumbleupon']['img'] = 'img/stumbleupon.png'
    data['RSS']['img'] = 'img/rss.png'

    # for i in data:
    #     data[i]['img'] = 'http://placekitten.com/50/50?image=5'
    return data


def add_id(data):
    global app_id
    for i in data:
        data[i]['id'] = 'app' + str(app_id)
        app_id += 1
    return data


def add_url(data):
    categories = ['Social Networks', 'Professional', 'Entertainment']

    data['Facebook']['url'] = 'http://www.facebook.com'
    data['Twitter']['url'] = 'http://www.twitter.com'
    data['LinkedIn']['url'] = 'http://www.linkedin.com'
    data['Pinterest']['url'] = 'http://www.pinterest.com'
    data['Tumblr']['url'] = 'http://www.tumblr.com'
    data['Spotify']['url'] = 'http://www.spotify.com'
    data['LastFM']['url'] = 'http://www.lastfm.com'
    data['Behance']['url'] = 'http://www.behance.com'
    data['Blogger']['url'] = 'http://www.blogger.com'
    data['Google Plus']['url'] = 'http://plus.google.com'
    data['Instagram']['url'] = 'http://www.instagram.com'
    data['Livejournal']['url'] = 'http://www.livejournal.com'
    data['Myspace']['url'] = 'http://www.myspace.com'
    data['Orkut']['url'] = 'http://www.orkut.com'
    data['Picasa']['url'] = 'http://www.picasa.com'
    data['Vimeo']['url'] = 'http://www.vimeo.com'
    data['Youtube']['url'] = 'http://www.youtube.com'
    data['Stumbleupon']['url'] = 'http://www.stumbleupon.com'
    data['RSS']['url'] = 'http://www.rss.com'
    return data



def add_categories(data):
    categories = ['Social Networks', 'Professional', 'Entertainment',
                    'Image Sharing', 'Music']

    data['Facebook']['category'] = categories[0]
    data['Twitter']['category'] = categories[0]
    data['LinkedIn']['category'] = categories[1]
    data['Pinterest']['category'] = categories[3]
    data['Tumblr']['category'] = categories[3]
    data['Spotify']['category'] = categories[4]
    data['LastFM']['category'] = categories[4]
    data['Behance']['category'] = categories[0]
    data['Blogger']['category'] = categories[0]
    data['Google Plus']['category'] = categories[0]
    data['Instagram']['category'] = categories[3]
    data['Livejournal']['category'] = categories[1]
    data['Myspace']['category'] = categories[1]
    data['Orkut']['category'] = categories[1]
    data['Picasa']['category'] = categories[3]
    data['Vimeo']['category'] = categories[2]
    data['Youtube']['category'] = categories[2]
    data['Stumbleupon']['category'] = categories[2]
    data['RSS']['category'] = categories[2]
    return data


def generate_times():
    t = start_of_time
    open_times = []
    close_times = []
    # from the beginning of data collection to now, randomly decides:
    #   a) length of visit
    #   b) time to next visit
    # and records open/close times in arrays, returning as a dict
    while t < now:
        open_times.append(time.mktime(t.timetuple()))
        t += random_timedelta(10, 3600 * 2)  # assume 10 seconds to 2 hours spent on site
        close_times.append(time.mktime(t.timetuple()))
        t += random_timedelta(10, 3600 * 9)  # assume next access is between 10 seconds and 9 hours later

    return {"open": open_times, "close": close_times}


def random_timedelta(lower, upper):
    '''Returns a timedelta in seconds between lower and upper'''
    return timedelta(0, random.randint(lower, upper))

if __name__ == "__main__":
    main()
