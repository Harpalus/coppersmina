# Coppersmina

User script that enhances Coppermine galleries with direct links, color coded
border and other tiny features.

Allows the use of mass downloaders like DownThemAll! and FlashGot.

Project repository:

https://github.com/ariacorrente/coppersmina

## Features

- Replace links in thumbnails to point directly to the high defintion image
- Add a colored border indicating the size of the image
- Append image information into the thumbnail's caption and remove the tooltip
- The "always run" feature allows the execution of the script even if the site
    is not automatically detected as a Coppermine gallery

## Settings

At the top of the script there are some variables the user can change to
customize the script behaviour.

- Choose what information to display into the capton of the thumbnail
- Toggle the display of the colored border
- Choose if the color of the border is calculated from the image KB size or the
    image dimensions
- Choose the colors to use for the border and the rages of size for each color
- Width of the colored border
- Toggle the "always run" feature
- Toggle the auto deactivation of the "always run" feature after 24 hours of the
    activation

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

To enable the "always run" feature search for a menu command into the
GreaseMonkey/Tampermonkey/etc menù.

I usually forget options like "always run" enabled, so i added an automatic
disabling after 24 hours.

Running the script in a non-coppermine site may cause problems and make some
sites misbehave.

The "always run" feature needs to read into the configuration if it's enabled or
not, this means a read from disk on every page load. If you are a performance
freak you can disable this option.
