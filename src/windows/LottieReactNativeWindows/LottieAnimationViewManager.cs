using Microsoft.ReactNative.Managed;
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace LottieReactNativeWindows
{
    public class LottieAnimationViewManager : AttributedViewManager<LottieAnimationView>
    {

        [ViewManagerProperty("sourceName")]
        public void SetSourceName(LottieAnimationView view, string value)
        {
            if (null != value)
            {
                view.Source = new Uri(value);
            }
            else
            {
                view.Source = null;
            }
        }

        [ViewManagerProperty("sourceJson")]
        public void SetSourceJson(LottieAnimationView view, string value)
        {
            view.SourceJson = value;
        }

        [ViewManagerProperty("speed")]
        public void SetSpeed(LottieAnimationView view, double value)
        {
            view.PlaybackRate = value;
        }

        [ViewManagerProperty("resizeMode")]
        public void SetResizeMode(LottieAnimationView view, string mode)
        {
            switch (mode.ToLower())
            {
                case "cover":
                    view.ResizeMode = Windows.UI.Xaml.Media.Stretch.UniformToFill;
                    break;
                case "contain":
                    view.ResizeMode = Windows.UI.Xaml.Media.Stretch.Uniform;
                    break;
                case "center":
                    view.ResizeMode = Windows.UI.Xaml.Media.Stretch.None;
                    break;
                default:
                    break;
            }
        }

        [ViewManagerProperty("loop")]
        public void SetLoop(LottieAnimationView view, bool value)
        {
            view.Loop = value;
        }

        [ViewManagerProperty("progress")]
        public void SetProgress(LottieAnimationView view, double value)
        {
            view.Progress = value;
        }

        [ViewManagerCommand("play")]
        public void Play(LottieAnimationView view, IReadOnlyList<double> args)
        {
            double from = 0.0;
            double to = 1.0;
            if (args != null && args.Count > 1)
            {
                from = args[0] >= 0.0 ? args[0] : 0.0;
                to = args[1] >= 0.0 ? args[1] : 1.0;
            }
            view.Play(from, to, OnAnimationFinish);
        }

        [ViewManagerCommand("reset")]
        public void Reset(LottieAnimationView view, IReadOnlyList<object> _)
        {
            view.Reset();
        }

        [ViewManagerCommand("pause")]
        public void Pause(LottieAnimationView view, IReadOnlyList<object> _)
        {
            view.Pause();
        }

        [ViewManagerCommand("resume")]
        public void Resume(LottieAnimationView view, IReadOnlyList<object> _)
        {
            view.Resume();
        }

        [ViewManagerExportedViewConstant("VERSION")]
        public int Version { get { return 1;  } }

        public delegate void SampleEventHandler(object sender, EventArgs e);

        [ViewManagerExportedBubblingEventTypeConstant("onAnimationFinish", "onAnimationFinish", "onAnimationFinishCapture")]
        public ViewManagerEvent<LottieAnimationView, Dictionary<string, bool>> OnAnimationFinish { get; set; }
    }
}
