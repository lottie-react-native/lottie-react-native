using System;
using System.Diagnostics;
using System.Collections.Generic;
using Windows.UI.Xaml;

using Microsoft.ReactNative;
using Microsoft.ReactNative.Managed;

namespace LottieReactNative
{
    internal class LottieAnimationViewManager : IViewManager,
                                                IViewManagerWithReactContext,
                                                IViewManagerWithExportedViewConstants,
                                                IViewManagerWithExportedEventTypeConstants,
                                                IViewManagerWithNativeProperties,
                                                IViewManagerWithCommands
    {
        #region IViewManager

        public string Name => nameof(LottieAnimationView);

        public FrameworkElement CreateView()
        {
            var view = new LottieAnimationView(this);
            view.HorizontalAlignment = HorizontalAlignment.Center;
            view.VerticalAlignment = VerticalAlignment.Center;
            view.PlaybackCompleted += View_PlaybackCompleted;
            return view;
        }

        private void View_PlaybackCompleted(object sender, PlaybackCompleteEventArgs e)
        {
            if (sender is LottieAnimationView view)
            {
                OnAnimationFinished(view, e.Canceled);
            }
        }

        #endregion

        #region IViewManagerWithReactContext

        public IReactContext ReactContext { get; set; }

        #endregion

        #region IViewManagerWithExportedViewConstants

        public ConstantProviderDelegate ExportedViewConstants => (writer) =>
        {
            writer.WriteObjectProperty("VERSION", 1);
        };

        #endregion

        #region IViewManagerWithExportedEventTypeConstants

        public ConstantProviderDelegate ExportedCustomDirectEventTypeConstants => null;

        public ConstantProviderDelegate ExportedCustomBubblingEventTypeConstants => (writer) =>
        {
            writer.WritePropertyName("animationFinish");
            writer.WriteObjectBegin();

            writer.WritePropertyName("phasedRegistrationNames");
            writer.WriteObjectBegin();

            writer.WriteObjectProperty("bubbled", "onAnimationFinish");

            writer.WriteObjectEnd();

            writer.WriteObjectEnd();
        };

        private void OnAnimationFinished(LottieAnimationView view, bool canceled)
        {
            ReactContext.UIDispatcher.Post(() =>
            {
                ReactContext.DispatchEvent(view, "animationFinish", (writer) =>
                {
                    writer.WriteArgs(canceled);
                });
            });
        }

        #endregion

        #region IViewManagerWithNativeProperties

        public IReadOnlyDictionary<string, ViewManagerPropertyType> NativeProps => new Dictionary<string, ViewManagerPropertyType>()
        {
            { "sourceName", ViewManagerPropertyType.String },
            { "sourceJson", ViewManagerPropertyType.String },
            { "resizeMode", ViewManagerPropertyType.String },
            { "progress", ViewManagerPropertyType.Number },
            { "speed", ViewManagerPropertyType.Number },
            { "loop", ViewManagerPropertyType.Boolean },
            { "imageAssetsFolder", ViewManagerPropertyType.String },
            { "colorFilters", ViewManagerPropertyType.Array },
        };

        public void UpdateProperties(FrameworkElement view, IJSValueReader propertyMapReader)
        {
            try
            {
                if (view is LottieAnimationView lottieAnimationView)
                {
                    var properties = JSValueObject.ReadFrom(propertyMapReader);
                    foreach (var kvp in properties)
                    {
                        try
                        {
                            switch (kvp.Key)
                            {
                                case "sourceName":
                                    lottieAnimationView.SetAnimation(kvp.Value.AsString());
                                    break;
                                case "sourceJson":
                                    lottieAnimationView.SetAnimationFromJson(kvp.Value.AsString());
                                    break;
                                case "resizeMode":
                                    lottieAnimationView.SetResizeMode(kvp.Value.AsString());
                                    break;
                                case "progress":
                                    lottieAnimationView.SetProgress(kvp.Value.AsSingle());
                                    break;
                                case "speed":
                                    lottieAnimationView.SetSpeed(kvp.Value.AsDouble());
                                    break;
                                case "loop":
                                    lottieAnimationView.SetLoop(kvp.Value.AsBoolean());
                                    break;
                                case "imageAssetsFolder":
                                    lottieAnimationView.SetImageAssetsFolder(kvp.Value.AsString());
                                    break;
                                case "colorFilters":
                                    // TODO when we have an API to specify color filters
                                    throw new Exception("Property colorFilters is not implemented.");
                            }
                        }
                        catch (Exception ex)
                        {
                            LogError(ex);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                LogError(ex);
            }
        }

        #endregion

        #region IViewManagerWithCommands

        public IReadOnlyList<string> Commands => new List<string>()
        {
            "play",
            "reset",
            "pause",
            "resume",
        };

        public void DispatchCommand(FrameworkElement view, string commandId, IJSValueReader commandArgsReader)
        {
            try
            {
                if (view is LottieAnimationView lottieAnimationView)
                {
                    switch (commandId)
                    {
                        case "play":
                            commandArgsReader.ReadArgs(out int startFrame, out int endFrame);
                            lottieAnimationView.Play(startFrame, endFrame);
                            break;
                        case "reset":
                            lottieAnimationView.Cancel();
                            lottieAnimationView.SetProgress(0);
                            break;
                        case "pause":
                            lottieAnimationView.Pause();
                            break;
                        case "resume":
                            lottieAnimationView.Resume();
                            break;
                    }
                }
            }
            catch (Exception ex)
            {
                LogError(ex);
            }
        }

        #endregion

        public void LogError(Exception ex)
        {
            Debug.WriteLine(ex);
            ReactContext.CallJSFunction("RCTLog", "logToConsole", (writer) =>
            {
                writer.WriteArgs("warn", $"LottieAnimationViewManager: {ex.Message}");
            });
        }
    }
}
