# Coppersmina

User script that enhances Coppermine galleries with direct links, color coded
border and other tiny features.

Allows the use of mass downloaders like DownThemAll! and FlashGot.

Project repository:

https://github.com/ariacorrente/coppersmina

## Features

- Configuration dialog accessible through menu command
- Replace links in thumbnails to point directly to the high defintion image
- Add a colored border indicating the size of the image
- Append image information into the thumbnail's caption
- Add a button to open the thumbnail's parent album into a new tab
- Remove the tooltip from the thumbnails
- The "always run" feature allows the execution of the script even if the site
    is not automatically detected as a Coppermine gallery

## Performance and security

AKA: Why is this script running on every page?

This script will run on every page because the domain name is not usefull to
identify an installed Coppermine gallery in the website.

Before doing the heavy work the script will try to detect if the page is a
Coppermine gallery. The script scans the page for anchors containing the string
"coppermine".

## "Always run" feature

The "always run" feature allows the execution of the heavy work even if the
script failed to detect the site as Coppermine gallery. This is usefull when
the webmaster changed the web pages resulting in a failed detection.

This option is domain specific because it's saved in local storage. When set for
a domain it will be remembered only for the current domain.

Running the script in a non-coppermine site may cause problems and make some
sites misbehave.
