# Contributing Guide

Contributions are welcome and are greatly appreciated! Every little bit helps, and credit will
always be given.


## Setting up your environment

After forking to your own github org, do the following steps to get started:

```bash
# clone your fork to your local machine
git clone https://github.com/airbnb/lottie-react-native.git

# step into local repo
cd lottie-react-native

# install dependencies
npm install

# run packager for development
npm run run:packager
```

### Developing on Android

While the packager is running and you have an Android device or emulator connected to your computer, build and launch the Android app.

```
npm run run:android
```

### Developing on iOS

You need to download the iOS dependencies at least once before you run the app.

```
npm run build:pods
```

While the packager is running and you have an iOS device or simulator connected to your computer, build and launch the iOS app.

```
npm run run:ios
```

### Style & Linting

This codebase adheres to the [Airbnb Styleguide](https://github.com/airbnb/javascript) and is
enforced using [ESLint](http://eslint.org/).

It is recommended that you install an eslint plugin for your editor of choice when working on this
codebase, however you can always check to see if the source code is compliant by running:

```bash
npm run lint
```


### Building Docs

Building the docs locally is extremely simple. First execute the following command:

```bash
npm run docs:watch
```

After this, you can open up your browser to the specified port (usually http://localhost:4000 )

The browser will automatically refresh when there are changes to any of the source files.


## Pull Request Guidelines

Before you submit a pull request from your forked repo, check that it meets these guidelines:

1. If the pull request adds functionality, the docs should be updated as part of the same PR.
1. If the pull request adds functionality, code in the example app that demonstrates the new functionality should be updated as part of the same PR.
1. If the pull request adds functionality, the PR description should include motivation and use cases for the feature.
1. If the pull request fixes a bug, an explanation including what the bug was, and how to reproduce it should be included in the PR description.
1. Please rebase and resolve all conflicts before submitting.
