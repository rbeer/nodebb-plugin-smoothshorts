# nodebb-plugin-smoothshorts

[![Code Climate](https://codeclimate.com/github/rbeer/nodebb-plugin-smoothshorts/badges/gpa.svg)](https://codeclimate.com/github/rbeer/nodebb-plugin-smoothshorts)

### Seamless short URL plugin for NodeBB
Nobody likes itchy pants, do you? Neither do I. :smirk:

That's why these shorts are seamlessly woven into the NodeBB experience, your users won't feel a thing.

## Installation
1. Preferably, install SmoothShorts from the list of available plugins in your NodeBB ACP.

  Manual installation via `npm install nodebb-plugin-smoothshorts` is possible, but doesn't guarantee compatibility with your NodeBB version.

2. Activate the plugin in ACP/Extend/Plugins.

3. Setup plugin (and hash already existing posts/topics) in [ACP/Plugins/SmoothShorts](#settings-acppluginssmoothshorts).

4. Go click 'em! :D

## Methods

### Copy Button

Given that the client's browser supports the [execCommand](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand "execCommand documentation at MDN")('copy'), SmoothShorts will add an icon next to post links, which copies the short URL with a single click. The [context menu](#context-menu) method is always available.

![SmoothShorts one-click button](assets/copyButton.png)

**NOTE**: If you are using NodeBB >=1.0.0, you have a more suitable icon (`.fa-hashtag`) available. The plugin's default `.fa-external-link` ensures backwards compatibility. You can change the icon in the [settings](#--copy-button).

### Context Menu

Once a user opens the browser's context menu upon a topic link, the href value of that link gets replaced with its assigned hash:

![SmoothShorts on a topic link](assets/onTopic.png?raw=true "SmoothShorts on a topic link")

This also works on posts:

![SmoothShorts on a post link](assets/onPost.png?raw=true "SmoothShorts on a post link")
(Not all themes have those links; same goes for teasers. Posts are hashed, regardless of used theme.)

The now copied address is of the form `https://yourNodeBB.org/ss/:hash` (default, see [URL Format](#--url-format)). Visiting it will redirect to the associated post or topic:

![SmoothShorts resolving a hash](assets/resolving.png?raw=true "SmoothShorts resolving a hash")

## Settings (ACP/Plugins/SmoothShorts)

###- Modifier key
  
  Users would have to press Ctrl/Alt/Shift while opening the context menu to replace the link.
###- URL Format

  Define the format of your short URLs! Use `:hash` as a placeholder for topic/post hashes.
  (e.g. short.com/ss/:hash, short.com/:hash, short.com/:hash/yolo)
  
  **NOTE**: Changing the URL format requires a NodeBB restart to apply the route hashes are accepted on.

###- Copy Button

Pick the icon for the copy button from the [fontawesome icon set](http://fontawesome.io/cheatsheet/).

## Q/A & Known Issues
###Why not use a service like bit.ly or goo.gl?
##### Coming in 0.4.0!

~~For two reasons:~~

~~1. While investigating bit.ly, I noticed that they impose limits on calls to their API. No need to hate them for it; in fact, they have every right to do so, protecting themselves against bots and such. But unfortunately, as hashing is triggered by every user creating a topic/post, a single spam attack on your NodeBB could make you run out of those API calls; just like that.~~

~~2. Links to posts in NodeBB are not structured like /topic/topicslug/*postID*, but rather /topic/topicslug/*positionInTopic*. Which means that if you purge a post, your already created short urls would get all mixed up.~~
