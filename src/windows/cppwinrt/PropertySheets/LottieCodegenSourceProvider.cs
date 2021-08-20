using System;
using System.IO;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Text;
using System.Threading.Tasks;
using Windows.Storage;
using Windows.Storage.Streams;

namespace AnimatedVisuals {
    public partial class LottieCodegenSourceProvider : LottieReactNative.ILottieSourceProvider
    {
        private IInputStream CreateStream(string contents) {
            byte[] data = Encoding.UTF8.GetBytes(contents);
            MemoryStream stream = new MemoryStream(data);
            return stream.AsRandomAccessStream();
        }

        // C# 7.3 has limited support for partial methods which prevents their use here
        // private partial async Task<Microsoft.UI.Xaml.Controls.IAnimatedVisualSource> GetSourceFromName_Task(string name);
        // private partial async Task<Microsoft.UI.Xaml.Controls.IAnimatedVisualSource> GetSourceFromJson_Task(string json);

        public Windows.Foundation.IAsyncOperation<Microsoft.UI.Xaml.Controls.IAnimatedVisualSource> GetSourceFromName(string name)
        {
            return AsyncInfo.Run((cancel) => { 
                return GetSourceFromName_Task(name);  
            });
        }

        public Windows.Foundation.IAsyncOperation<Microsoft.UI.Xaml.Controls.IAnimatedVisualSource> GetSourceFromJson(string json)
        {
            return AsyncInfo.Run((cancel) => { 
                return GetSourceFromJson_Task(json);
            });
        }
    }
}