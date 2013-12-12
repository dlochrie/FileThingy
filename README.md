FileThingy
==========

Renames Files and Directories Given a Renaming Recipe.

## Description

Given a source and target directory, FileThingy will create a new directory
structure, and rename the files given whatever `Recipe` you provide. 

FileThingy also overcomes your OS throwing `EMFILE` errors, by queing file
operations, so that you can process large amounts of files and directories
without exiting prematurely.

### Uses

 * Organizing your photos.
 * Organizing your music files.
 * Cronjob processing for imports and exports. 
 * More uses to come.


## Recipes

[Coming Soon]

###Default Recipe

The default recipe basically attempts to copy/move the files and directories
specified in the `sourceDir` to the `targetDir`. Any files in the root of the
`sourceDir` will be renamed and stored in a new directory based on the file
name.

TODO: Add a better description of the default recipe and provide example 
before and after structure.

## Usage

    node FileThingy [SOURCE DIRECTORY] [TARGET DIRECTORY]

## TODOs:

 * Add `optimist` dependency for proper command line test and argument handling.
 * Work on the Recipe engine, so that Recipe's can be read and processed.
 * Restructure so that when installed globally, it can be invoked without having 
   to call `node`.

