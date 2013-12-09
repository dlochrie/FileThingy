FileThingy
==========

Renames Files and Directories Given a Renaming Recipe

## Usage

    node FileThingy [SOURCE DIRECTORY] [OPTIONS]


## Caveats: Batching

Due to the limitations of the native Node `fs`module, `graceful-fs` has been 
substituted. What this means, is that this module can, for now, perform file
renaming without the OS spitting out `EMFILE` errors. You can read more about
this [here](http://blog.izs.me/post/56827866110/wtf-is-emfile-and-why-does-it-happen-to-me).

There seems to be an opened file limitation for operating systems. For example,
Ubuntu has a limitation of 1024 opened files. Mac has a limitation of 256.

Check your system from the terminal with: `ulimit -n`.

Since all `graceful-fs` does for us is _gracefully_ ignore FS errors, this
module was written to handle file processing/renaming in batches. This means
that instead of a directory structure like this:

    {
      "my dir one": [
        "file one.ext",
        "file one.ext",
        "file one.ext",
        // 1000s more files here
      ],
      "my dir two": [
        // ...files..
      ],
    }

...it looks like this (ignoring the naming convention - used for brevity):

    {
      "my dir one": [
        [
          "file 001.ext",
          "file 002.ext",
          "file 003.ext",
          //... all the way till file one hundred
          "file 100.ext",
        ], [
          "file 101.ext",
          "file 102.ext",
          "file 103.ext",
          // ...
          "file 200.ext",
        ]
      ],
      // etc
    }
    
Which basically means that files are being batched in sets of 100. This limit should be
able to be set through a flag, coming soon.


