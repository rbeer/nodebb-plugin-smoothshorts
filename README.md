[![endorse](https://api.coderwall.com/rbeer/endorsecount.png)](https://coderwall.com/rbeer)
﻿
# nodebb-plugin-smoothshorts
### Seamless short URL plugin for NodeBB
Nobody likes itchy pants, do you? Neither do I, that's why these shorts are seamlessly woven into the NodeBB experience, your users won't feel a thing.

## Installation
1. `npm install nodebb-plugin-smoothshorts`

2. Activate the plugin in the ACP.

3. Go click 'em! :D

## Features
(Please note: Already existing topics and posts do not have a hash associated with them. Batch-hashing those will be part of the next patch (0.0.2); promised!)

Once a user opens the browser's context menu upon a topic link, the href value of that link gets replaced with its assigned hash:

![SmoothShorts on a topic link](assets/onTopic.png?raw=true "SmoothShorts on a topic link")

This also works on posts (theme-persona; theme-lavender doesn't have those permalinks):

![SmoothShorts on a post link](assets/onPost.png?raw=true "SmoothShorts on a post link")

The now copied address is one of the form `https://yourNodeBB.org/ss/HASH`. Visiting it will set some logic in motion, finding the associated post or topic and redirecting accordingly:

![SmoothShorts resolving a hash](assets/resolving.png?raw=true "SmoothShorts resolving a hash")

The original address is restored on any next `mousedown` event. This way even if the just hashed and copied link is clicked, the user will be visiting that original, since the event is processed before the browser attempts to follow the link. (Tested in FireFox 38.05 and Chrome 43.0; [please let me know if your browser doesn't work](https://github.com/rbeer/nodebb-plugin-smoothshorts/issues "")!)

## FAQ
###Why not use a service like bit.ly or goo.gl?
For two reasons:

1. While investigating bit.ly, I noticed that they impose limits on calls to their API. No need to hate them for doing it; in fact, they have every right to do so, protecting themselves against bots and such. But unfortunately, as hashing is triggered by every user creating a topic/post, a single spam attack on your NodeBB could make you run out of those API calls; just like that.
2. Links to posts are in NodeBB not structured like /topic/topicslug/*postID*, but rather /topic/topicslug/*positionInTopic*. Which means that if you purge a post, your already created short urls get all mixed up.
