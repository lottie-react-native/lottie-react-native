using Microsoft.ReactNative.Managed;
using Microsoft.Toolkit.Uwp.UI.Lottie;
using Microsoft.UI.Xaml.Controls;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Windows.Storage;
using Windows.UI;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Media;

// The User Control item template is documented at https://go.microsoft.com/fwlink/?LinkId=234236

namespace LottieReactNativeWindows
{
    public sealed partial class LottieAnimationView : UserControl
    {
        private const string CODEGEN_PREFIX = "CodeGen";

        private Uri _sourceUri;
        private IAnimatedVisualSource _animatedVisualSource;
        private Dictionary<string, Color> _colorFilters;
        private double _speed;
        private double _progress;
        private Task _playback;
        private string _sourceJson;

        public Dictionary<string, Color> ColorFilters
        {  
            get 
            { 
                return _colorFilters; 
            }
            set 
            {
                _colorFilters = value; 
                ApplyColorFilters();
            } 
        }

        public Uri Source
        {
            get
            {
                return _sourceUri;
            }
            set
            {
                _animatedVisualSource = GenerateSource(value);
                LottiePlayer.Source = _animatedVisualSource;
                _sourceUri = value;
                ApplyColorFilters();
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

        private IAnimatedVisualSource InstantiateCodeGenSource(string objectToInstantiate)
        {
            var objectType = Type.GetType(objectToInstantiate);
            if (objectType == null)
            {
                return null;
            }
            return (IAnimatedVisualSource)Activator.CreateInstance(objectType);
        }

        private string CleanupPrefix(string s)
        {
            return s.Replace(String.Format("{0}://", CODEGEN_PREFIX), "", StringComparison.OrdinalIgnoreCase);
        }

        private string HostnameToTypeName(string s)
        {
            var components = s.Split(".");
            if (components.Length <= 1)
            {
                return s;
            }

            var projectName = components[0];
            var classNameComponents = new string[components.Length - 1];
            Array.Copy(components, 1, classNameComponents, 0, components.Length - 1);

            return String.Format("{0}, {1}", String.Join(".", classNameComponents), projectName);
        }

        private IAnimatedVisualSource GenerateSource(Uri uri)
        {
            if (uri.Scheme.Equals(CODEGEN_PREFIX, StringComparison.OrdinalIgnoreCase))
            {
                return InstantiateCodeGenSource(HostnameToTypeName(CleanupPrefix(uri.OriginalString)));
            }

            return new LottieVisualSource
            {
                UriSource = uri
            };
        }

        private void ApplyColorFilters()
        {
            if (_colorFilters == null || _animatedVisualSource == null)
            {
                return;
            }

            foreach (var kv in _colorFilters)
            {
                TryApplyColorFilter(_animatedVisualSource, kv.Key, kv.Value);
            }
        }

        private void TryApplyColorFilter(object data, string propertyName, Color color)
        {
            var args = new object[] { color };
            try
            {
                data.GetType().InvokeMember(
                       propertyName,
                       BindingFlags.Instance | BindingFlags.Public | BindingFlags.SetProperty,
                       Type.DefaultBinder,
                       data, args);
            }
            catch (Exception e)
            {
                Debug.WriteLine("Exception while setting color filter: {0}", e.Message);
            }
        }
    }
}
