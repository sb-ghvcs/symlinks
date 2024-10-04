# Create Symlinks/Shortcuts on your Self-Hosted Runners

I created this for my personal use case where I wanted to be able to create
shortcuts to my self-hosted windows runners. It is a very basic action at this
point with a lot of scope for improvements, such as handling more cases or
creating hardlinks. Feel free to suggest improvements with PRs

## Supported OS

- Linux
- Windows

## Reference

The windows implementaion utilizes the VB Script created by
[nwutils](https://github.com/nwutils) in their package
[create-desktop-shortcuts](https://github.com/nwutils/create-desktop-shortcuts)
and heavily draws on it's input pattern
