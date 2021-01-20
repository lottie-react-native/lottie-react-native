#include "pch.h"
#include "LottieAnimationViewManager.h"

#include <winrt/Windows.UI.Xaml.h>
#include <winrt/Windows.UI.Xaml.Controls.h>
#include <winrt/Windows.UI.Xaml.Media.h>
#include <winrt/Microsoft.UI.Xaml.Controls.h>


#include "NativeModules.h"

namespace winrt {
    using namespace winrt::Windows::Foundation;
    using namespace winrt::Windows::Foundation::Collections;
    using namespace winrt::Windows::UI;
    using namespace winrt::Windows::UI::Xaml;
    using namespace winrt::Windows::UI::Xaml::Controls;
    using namespace winrt::Windows::UI::Xaml::Media;
}
using namespace winrt::Microsoft::ReactNative;

namespace winrt::LottieReactNative::implementation {

    LottieAnimationViewManager::LottieAnimationViewManager(winrt::LottieReactNative::ILottieSourceProvider lottieSourceProvider)
        : m_lottieSourceProvider(lottieSourceProvider) {
    }

    // IViewManager
    winrt::hstring LottieAnimationViewManager::Name() noexcept {
        return L"LottieAnimationView";
    }

    winrt::Windows::UI::Xaml::FrameworkElement LottieAnimationViewManager::CreateView() noexcept {
        auto control = winrt::LottieReactNative::LottieView(m_reactContext, m_lottieSourceProvider);
        return control;
    }

    // IViewManagerWithReactContext
    winrt::Microsoft::ReactNative::IReactContext LottieAnimationViewManager::ReactContext() noexcept {
        return m_reactContext;
    }
    void LottieAnimationViewManager::ReactContext(winrt::Microsoft::ReactNative::IReactContext reactContext) noexcept {
        m_reactContext = reactContext;
    }

    // IViewManagerWithNativeProperties
    winrt::IMapView<winrt::hstring, ViewManagerPropertyType> LottieAnimationViewManager::NativeProps() noexcept
    {
        auto nativeProps = winrt::single_threaded_map<winrt::hstring, ViewManagerPropertyType>();

        nativeProps.Insert(L"loop", ViewManagerPropertyType::Boolean);
        nativeProps.Insert(L"speed", ViewManagerPropertyType::Number);
        nativeProps.Insert(L"progress", ViewManagerPropertyType::Number);
        nativeProps.Insert(L"resizeMode", ViewManagerPropertyType::String);
        nativeProps.Insert(L"sourceName", ViewManagerPropertyType::String);
        nativeProps.Insert(L"sourceJson", ViewManagerPropertyType::String);
        nativeProps.Insert(L"imageAssetsFolder", ViewManagerPropertyType::String);
        nativeProps.Insert(L"colorFilters", ViewManagerPropertyType::Array);

        nativeProps.Insert(L"useNativeLooping", ViewManagerPropertyType::Boolean);

        return nativeProps.GetView();
    }

    void LottieAnimationViewManager::UpdateProperties(
        winrt::FrameworkElement const& view,
        IJSValueReader const& propertyMapReader) noexcept
    {
        if (auto control = view.try_as<winrt::LottieReactNative::LottieView>()) {
            auto propMap = JSValue::ReadObjectFrom(propertyMapReader);
            for (auto const& pair : propMap) {
                auto const& propertyName = pair.first;
                auto const& propertyValue = pair.second;

                if (propertyName == "progress") {
                    auto progress = ReadValue<std::optional<double>>(propertyValue);

                    control.SetProgress(progress.value_or(0));
                }
                else if (propertyName == "speed") {
                    auto speed = ReadValue<std::optional<double>>(propertyValue);

                    control.SetSpeed(speed.value_or(1.0));
                }
                else if (propertyName == "resizeMode") {
                    auto resizeMode = ReadValue<std::optional<std::string>>(propertyValue);
                    auto stretch = winrt::Windows::UI::Xaml::Media::Stretch::Uniform;
                    if (resizeMode == "cover") {
                        stretch = winrt::Windows::UI::Xaml::Media::Stretch::UniformToFill;
                    }
                    else if (resizeMode == "stretch") {
                        stretch = winrt::Windows::UI::Xaml::Media::Stretch::Fill;
                    }
                    else if (resizeMode == "contain") {
                        stretch = winrt::Windows::UI::Xaml::Media::Stretch::Uniform;
                    }
                    else if (resizeMode == "center") {
                        stretch = winrt::Windows::UI::Xaml::Media::Stretch::None;
                    }
                    control.ResizeMode(stretch);
                }
                else if (propertyName == "loop") {
                    control.SetLoop(propertyValue.AsBoolean());
                }
                else if (propertyName == "useNativeLooping") {
                    control.SetNativeLooping(propertyValue.AsBoolean());
                }
                else if (propertyName == "sourceName") {
                    auto sourceName = ReadValue<std::optional<std::wstring>>(propertyValue);

                    control.SetSourceName(sourceName.value_or(L""));
                }
                else if (propertyName == "sourceJson") {
                    auto sourceJson = ReadValue<std::optional<std::wstring>>(propertyValue);
                    control.SetSourceJson(sourceJson.value_or(L""));
                }
                else if (propertyName == "imageAssetsFolder") {
                    
                }
                else if (propertyName == "colorFilters") {
                    
                }
            }
            control.ApplyPropertyChanges();
        }
    }

    // IViewManagerWithCommands
    winrt::Windows::Foundation::Collections::IVectorView<winrt::hstring> LottieAnimationViewManager::Commands() noexcept
    {
        auto commands = winrt::single_threaded_vector<winrt::hstring>();
        commands.Append(L"play");
        commands.Append(L"pause");
        commands.Append(L"reset");
        commands.Append(L"resume");
        return commands.GetView();
    }

    void LottieAnimationViewManager::DispatchCommand(
        winrt::Windows::UI::Xaml::FrameworkElement const& view,
        winrt::hstring command,
        winrt::Microsoft::ReactNative::IJSValueReader const& commandArgsReader) noexcept
    {
        if (auto control = view.try_as<winrt::LottieReactNative::LottieView>()) {
            if (command == L"play") {
                int64_t from, to;
                ReadArgs(commandArgsReader, from, to);
                control.Play(from, to);
            }
            else if (command == L"pause") {
                control.Pause();
            }
            else if (command == L"reset") {
                control.Reset();
            }
            else if (command == L"resume") {
                control.Resume();
            }
        }
    }

    // IViewManagerWithExportedViewConstants
    winrt::Microsoft::ReactNative::ConstantProviderDelegate LottieAnimationViewManager::ExportedViewConstants() noexcept
    {
        // Export VERSION constant for use with react-native-safe-modules and CodePush
        return [](IJSValueWriter const& constantWriter) {
            WriteProperty(constantWriter, "VERSION", 1);
        };
    }

    // IViewManagerWithExportedEventTypeConstants
    winrt::Microsoft::ReactNative::ConstantProviderDelegate LottieAnimationViewManager::ExportedCustomBubblingEventTypeConstants() noexcept
    {
        return nullptr;
    }

    winrt::Microsoft::ReactNative::ConstantProviderDelegate LottieAnimationViewManager::ExportedCustomDirectEventTypeConstants() noexcept
    {
        return [](IJSValueWriter const& constantWriter) {
            WriteCustomDirectEventTypeConstant(constantWriter, "onAnimationLoop", "onAnimationLoop");
            WriteCustomDirectEventTypeConstant(constantWriter, "onAnimationFinish", "onAnimationFinish");
        };
    }
}