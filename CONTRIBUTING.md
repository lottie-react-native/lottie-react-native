# Contributing Guide

Contributions are welcome and are greatly appreciated! Every little bit helps, and credit will
always be given.

## Setting up your environment

After forking to your own github org, do the following steps to get started:

```bash
# clone your fork to your local machine
git clone https://github.com/lottie-react-native/lottie-react-native.git

# step into local repo
cd lottie-react-native

# install dependencies (this repo uses Yarn 4 via corepack; do not use npm)
yarn install

# run packager for development
yarn run:bundler
```

### Developing on Android

While the packager is running and you have an Android device or emulator connected to your computer, build and launch the Android app.

```
yarn fabric:android
```

### Developing on iOS

While the packager is running and you have an iOS device or simulator connected to your computer, build and launch the iOS app. This installs the CocoaPods dependencies first.

```
yarn workspace example ios
```

### Developing on Web

First, you have to install all dependencies:

```
yarn
```

After that, you have to build the library. You have to do that each time you want to see the changes in the example app, as currently, we don't support hot reloading in the demo app.

```
yarn setup
```

Finally, you can run the demo. Then you can go to the link printed in the terminal to see the demo.

```
yarn run:web
```

### Working on v8 (`packages/nitro`)

`packages/nitro` is a work-in-progress rewrite on [Nitro Modules](https://nitro.margelo.com),
intended to become v8. It is **not** the package that ships — `packages/core` is
still `lottie-react-native`. It has its own example app, `example-v8`, which is a
copy of `example` so the two can be run side by side and compared.

```bash
yarn nitro:run:bundler   # Metro for example-v8
yarn nitro:android       # run example-v8 on Android
yarn nitro:ios           # run example-v8 on iOS
yarn nitro:run:web
```

**If you edit `packages/nitro/src/LottieView.nitro.ts`, you must re-run codegen and
commit the result:**

```bash
yarn nitro:codegen
```

`nitrogen/generated/` is committed deliberately — the podspec, `build.gradle`,
`CMakeLists.txt` and the view wrapper all reference generated artifacts, so a fresh
clone cannot even `pod install` without them. CI regenerates and fails if the
committed output has drifted from the spec. After codegen adds or removes files you
also need `yarn nitro:pods` and a Gradle sync.

Checks, all of which CI runs:

```bash
yarn nitro:tsc:lib       # typecheck the package
yarn nitro:tsc           # typecheck example-v8
yarn nitro:lint:swift
```

Before changing v8 behaviour, read `packages/nitro/ARCHITECTURE.md`. It is the single
source of truth for the port: how it works, and every deliberate divergence from v7 and
why — including v7 bugs that are reproduced on purpose so upgrading is not a silent
behavioural change. `MIGRATION-7-TO-8.md` is the user-facing subset.

v8 source files carry no comments; that rationale lives in the architecture document
instead. See `AGENTS.md` for the policy and its carve-outs before adding one.

### Style & Linting

This codebase adheres to the [Airbnb Styleguide](https://github.com/airbnb/javascript) and is
enforced using [ESLint](http://eslint.org/).

It is recommended that you install an eslint plugin for your editor of choice when working on this
codebase, however you can always check to see if the source code is compliant by running:

```bash
yarn workspace lottie-react-native lint
```

For linting the native iOS package, we are using [Swift lint](https://github.com/realm/SwiftLint). You need to install it on your machine using the following command:

```bash
brew install swiftlint
```

And then you can run it by calling it from JS using:

```bash
yarn lint:swift
```

Or let it work on its own, as it is part of the build phases for the iOS project

### Docs

The API reference lives in [`docs/api.md`](docs/api.md) and is plain Markdown — edit
it directly. There is no docs build step; the GitBook setup this section used to
describe was removed.

## Pull Request Guidelines

Before you submit a pull request from your forked repo, check that it meets these guidelines:

1. If the pull request adds functionality, the docs should be updated as part of the same PR.
1. If the pull request adds functionality, code in the example app that demonstrates the new functionality should be updated as part of the same PR.
1. If the pull request adds functionality, the PR description should include motivation and use cases for the feature.
1. If the pull request fixes a bug, an explanation including what the bug was, and how to reproduce it should be included in the PR description.
1. Please rebase and resolve all conflicts before submitting.
