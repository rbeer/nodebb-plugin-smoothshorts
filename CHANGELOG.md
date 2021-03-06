﻿### 0.3.2 [2016-05-02]
  - **FIX**: Recognize sub-categories (#11 / 3702b2c).
  - **META**: Added grunt tasks
  - **FIX**: Hashes can be 8 OR 7 digits long (b1ee0a6)
  - **CHANGE**: Use [attribute*=value] to find topic links (3d11ea7)
  - **FIX**: Wrongfully given error message on hash creation. (#14 / 5b31753)
  - **FIX**: Topic links in lavender home-teaser (#11 / 6ee88c2)

### 0.3.1 [2016-04-21]
  - **FIX**: Overlooked module rename

### 0.3.0
  - **BREAKING CHANGE**: Former setting *Forced Domain* is now *URL Format*.
    - Allows admins to set the short urls' format to whatever they want. Including domain, path and hash insertion point, using keyword `:hash`.
    - settings:smoothshorts.useDomain/forcedDomain replaced by settings:smoothshorts.shortFormat
  - **ADD**: Icon shown on copy button can be changed in the ACP settings.
  - **CHANGE**: Use socket.io to save settings (ACP)
  - **REFACTOR**:
    - Split back-end scripts into modules (hashing, settings, sockets, controller)
    - Extracted CSS and JS from ACP page
    - Split ACP template into index and settings, stat(u)s partials

### 0.2.1
  - **ADD**: Fallback for missing teaser post ids in NodeBB versions < 1.0.3 .

### 0.2.0
  - **REWORK**: Front-end scripts:
    - Detect and enable topic/post links on every page (e.g. /unread, /popular), including teasers and listings in users' profiles.
  - **ADD**: Button to copy short url with a single click. (At posts in topic view, only.)

### 0.1.3
  - **FIX**: ACP | Failing to save settings.

### 0.1.2
  - **FIX**: ACP | .input-group-addon misplaced.

  - **FIX**: ACP | Checkbox-\<input\>s not clickable due to core changes.

### 0.1.0
  - **ADD**: ACP page
    - Settings
    - Create missing hashs topics/posts.
  - **ADD**: *Modifier key* (ctrl, alt or shift) to replace urls.
  - **ADD**: *Forced domain* to change domain for short urls.
    (https://prettylongdomain.org/topic/2/slug/ -> https://short.org/ss/hash)
