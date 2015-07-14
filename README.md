# nodebb-plugin-smoothshorts

### Seamless short URL plugin for NodeBB
Nobody likes itchy pants, do you? Neither do I, that's why these shorts are seamlessly woven into the NodeBB experience, your users won't feel a thing.

## Installation
1. `npm install nodebb-plugin-smoothshorts`

2. Activate the plugin in the ACP.

3. Go click 'em! :D

## Features

### General

Once a user opens the browser's context menu upon a topic link, the href value of that link gets replaced with its assigned hash:

![SmoothShorts on a topic link](assets/onTopic.png?raw=true "SmoothShorts on a topic link")

This also works on posts:

![SmoothShorts on a post link](assets/onPost.png?raw=true "SmoothShorts on a post link")
(not all themes have those links; posts are hashed, regardless of used theme)

The now copied address is of the form `https://yourNodeBB.org/ss/HASH`. Visiting it will set some logic in motion, finding the associated post or topic and redirecting accordingly:

![SmoothShorts resolving a hash](assets/resolving.png?raw=true "SmoothShorts resolving a hash")

The original address is restored on any next `mousedown` event. This way, even if the just replaced and copied link is clicked, the user will be visiting that original. (Tested in FireFox 38.05 and Chrome 43.0; [please let me know if your browser doesn't work](https://github.com/rbeer/nodebb-plugin-smoothshorts/issues "")!)

### Options

  - Modifier key: Users would have to press Ctrl/Alt/Shift while opening the context menu in order to replace the link;
  - Forced domain: Short urls are forced onto this domain, disregarding which the user chose to visit the board.

### Why not use a service like bit.ly or goo.gl?

For two reasons:

1. While investigating bit.ly, I noticed that they impose limits on calls to their API. No need to hate them for it; in fact, they have every right to do so, protecting themselves against bots and such. But unfortunately, as hashing is triggered by every user creating a topic/post, a single spam attack on your NodeBB could make you run out of those API calls; just like that.

2. Links to posts in NodeBB are not structured like /topic/topicslug/*postID*, but rather /topic/topicslug/*positionInTopic*. Which means that if you purge a post, your already created short urls would get all mixed up.
