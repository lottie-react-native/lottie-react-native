using Microsoft.ReactNative.Managed;
using Microsoft.Toolkit.Uwp.UI.Lottie;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.Storage;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Media;

// The User Control item template is documented at https://go.microsoft.com/fwlink/?LinkId=234236

namespace LottieReactNativeWindows
{
    public sealed partial class LottieAnimationView : UserControl
    {
        private Uri _source;
        private double _speed;
        private double _progress;
        private Task _playback;
        private string _sourceJson;

        public Uri Source
        {
            get
            {
                return _source;
            }
            set
            {
                LottiePlayer.Source = new LottieVisualSource
                {
                    UriSource = value
                };
                _source = value;
            }
        }

        public String SourceJson
        {
            get
            {
                return _sourceJson;
            }
            set
            {
                AssignTempFileWithValue(value);
                _sourceJson = value;
            }
        }

        static string Sha256(string data)
        {
            var crypt = new SHA256Managed();
            var hashBuilder = new StringBuilder();
            byte[] crypto = crypt.ComputeHash(Encoding.ASCII.GetBytes(data));
            foreach (byte theByte in crypto)
            {
                hashBuilder.Append(theByte.ToString("x2"));
            }
            return hashBuilder.ToString();
        }

        async void AssignTempFileWithValue(String value)
        {
            var tempFolder = ApplicationData.Current.TemporaryFolder;
            var fileName = Sha256(value);
            var exists = (await tempFolder.TryGetItemAsync(fileName)) != null;
            if (!exists)
            {
                var tempFile = await tempFolder.CreateFileAsync(fileName);
                await FileIO.WriteTextAsync(tempFile, value);
            }
            Source = new Uri(String.Format("ms-appdata:///temp/{0}", fileName));
        }

        public bool Loop { get; set; }

        public double PlaybackRate
        {
            get
            {
                return _speed;
            }
            set
            {
                LottiePlayer.PlaybackRate = value;
                _speed = value;
            }
        }

        public Stretch ResizeMode
        {
            get
            {
                return LottiePlayer.Stretch;
            }
            set
            {
                LottiePlayer.Stretch = value;
            }
        }

        public double Progress
        {
            get
            {
                return _progress;
            }
            set
            {
                LottiePlayer.SetProgress(value);
                _progress = value;
            }
        }

        public async void Play(double from, double to, ViewManagerEvent<LottieAnimationView, Dictionary<string, bool>> completion)
        {
            if (!LottiePlayer.IsAnimatedVisualLoaded)
            {
                var d = Window.Current.Dispatcher;
                _ = Task.Delay(100).ContinueWith(t =>
                {
                    _ = d.RunAsync(Windows.UI.Core.CoreDispatcherPriority.Normal, () =>
                    {
                        Play(from, to, completion);
                    });
                });
                return;
            }

            _playback = LottiePlayer.PlayAsync(from, to, Loop).AsTask();

            await _playback;

            if (completion != null && _playback.IsCompleted)
            {
                completion.Invoke(this, new Dictionary<string, bool> { { "isCancelled", _playback.IsCanceled || _playback.IsFaulted } });
            }
        }

        public void Reset()
        {
            LottiePlayer.SetProgress(0.0);
            LottiePlayer.Pause();
        }

        public void Pause()
        {
            LottiePlayer.Pause();
        }

        public void Resume()
        {
            LottiePlayer.Resume();
        }

        public LottieAnimationView()
        {
            InitializeComponent();
        }
    }
}
