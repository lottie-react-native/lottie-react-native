using System;
using System.IO;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.Storage;
using Windows.UI.Core;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Media;

using Microsoft.Toolkit.Uwp.UI.Lottie;
using Microsoft.UI.Xaml.Controls;

namespace LottieReactNative
{
    internal class LottieAnimationView : AnimatedVisualPlayer
    {
        // TODO: Replace frame to progress conversions
        private double _framesPerSecond = 60.0;

        private double _playbackSpeed = 1.0;
        private int _playbackDirection = 1;

        private bool _loop = false;

        private string _imageAssetsFolder = "";

        private Action _playOnAnimatedVisualLoaded = null;

        private IAsyncAction _playAction = null;

        private readonly LottieAnimationViewManager _viewManager;

        public LottieAnimationView(LottieAnimationViewManager viewManager) : base()
        {
            _viewManager = viewManager;
            Source = new LottieVisualSource();
            Loaded += LottieAnimationView_Loaded;
        }

        private void LottieAnimationView_Loaded(object sender, RoutedEventArgs e)
        {
            _playOnAnimatedVisualLoaded?.Invoke();
            _playOnAnimatedVisualLoaded = null;
        }

        public event EventHandler<PlaybackCompleteEventArgs> PlaybackCompleted;

        public void SetAnimation(string sourceName)
        {
            // iOS doesn't specify extensions, so we set this here
            if (!Path.HasExtension(sourceName))
            {
                sourceName += ".json";
            }

            // This doesn't feel correct in all circumstances
            // Can we get the root from ReactContext instead of hardcoding this here?
            string root = "ms-appx:///Bundle/assets/";

            var uri = new Uri(Uri.IsWellFormedUriString(sourceName, UriKind.Absolute) ? sourceName : Path.Combine(root, _imageAssetsFolder, sourceName));

            var task = Task.Factory.StartNew(async () =>
            {
                await Dispatcher.RunAsync(CoreDispatcherPriority.Normal, async () =>
                {
                    try
                    {
                        await (Source as LottieVisualSource)?.SetSourceAsync(uri);
                    }
                    catch (Exception ex)
                    {
                        _viewManager?.LogError(ex);
                    }
                });
            });
            task.Wait();
        }

        public void SetAnimationFromJson(string lottieJson)
        {
            var task = Task.Factory.StartNew(async () =>
            {
                try
                {
                    // TODO: Replace this workaround when we have an API to pass the JSON directly to LottieVisualSource
                    var lottieFile = await CreateTempFileAsync(lottieJson);
                    await Dispatcher.RunAsync(CoreDispatcherPriority.Normal, async () =>
                    {
                        try
                        {
                            await (Source as LottieVisualSource)?.SetSourceAsync(lottieFile);
                        }
                        catch (Exception ex)
                        {
                            _viewManager?.LogError(ex);
                        }
                    });
                    await lottieFile.DeleteAsync(StorageDeleteOption.PermanentDelete);
                }
                catch (Exception ex)
                {
                    _viewManager?.LogError(ex);
                }
            });
            task.Wait();
        }

        private async Task<StorageFile> CreateTempFileAsync(string contents)
        {
            var storageFolder = ApplicationData.Current.TemporaryFolder;

            var tempFile = await storageFolder.CreateFileAsync(Path.GetFileName(Path.GetTempFileName()));

            await FileIO.WriteTextAsync(tempFile, contents);

            return tempFile;
        }

        public void SetResizeMode(string value)
        {
            var stretch = Stretch.None;

            switch (value)
            {
                case "cover":
                    stretch = Stretch.UniformToFill;
                    break;
                case "contain":
                    stretch = Stretch.Uniform;
                    break;
                case "center":
                    stretch = Stretch.None; // Does this center?
                    break;
            }

            Stretch = stretch;
        }

        public void SetSpeed(double value)
        {
            _playbackSpeed = value;
            SetPlaybackRate();
        }

        private void SetPlaybackRate()
        {
            PlaybackRate = _playbackDirection * _playbackSpeed;
        }

        public void SetLoop(bool value)
        {
            _loop = value;
        }

        public void SetImageAssetsFolder(string value)
        {
            _imageAssetsFolder = value ?? "";
        }

        public void Play(int startFrame, int endFrame)
        {
            if (!IsAnimatedVisualLoaded)
            {
                // Make sure the playback starts immediately after it's loaded into the tree
                _playOnAnimatedVisualLoaded = async () =>
                {
                    await Dispatcher.RunAsync(CoreDispatcherPriority.Normal, async () =>
                    {
                        while (!IsAnimatedVisualLoaded)
                        {
                            await Task.Yield();
                        }

                        Play(startFrame, endFrame);
                    });
                };
                return;
            }

            // TODO: Remove frame to progress conversions when we have a playback API based on frames
            double fromProgress = 0.0;
            double toProgress = 1.0;

            if (startFrame != -1 && endFrame != -1)
            {
                _playbackDirection = startFrame > endFrame ? -1 : 1;
                SetPlaybackRate();

                fromProgress = startFrame / Math.Max(1, _framesPerSecond * Duration.TotalSeconds);
                toProgress = endFrame / Math.Max(1, _framesPerSecond * Duration.TotalSeconds);
            }

            SetProgress(fromProgress);

            _playAction = PlayAsync(fromProgress, toProgress, _loop);
            _playAction.Completed = (asyncInfo, asyncStatus) =>
            {
                OnPlaybackCompleted(asyncStatus == AsyncStatus.Canceled);
            };
        }

        public void Cancel()
        {
            _playAction?.Cancel();
        }

        protected void OnPlaybackCompleted(bool canceled)
        {
            _playAction = null;
            PlaybackCompleted?.Invoke(this, new PlaybackCompleteEventArgs(canceled));
        }
    }

    internal class PlaybackCompleteEventArgs : EventArgs
    {
        public readonly bool Canceled;

        public PlaybackCompleteEventArgs(bool canceled)
        {
            Canceled = canceled;
        }
    }
}
