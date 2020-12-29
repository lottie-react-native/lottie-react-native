#include "pch.h"
#include "LottieAnimationViewManager.h"

#include <winrt/Windows.UI.Xaml.h>
#include <winrt/Windows.UI.Xaml.Controls.h>
#include <winrt/Windows.UI.Xaml.Media.h>

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
        auto control = winrt::LottieReactNative::LottieView(m_reactContext);
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

        nativeProps.Insert(L"autoPlay", ViewManagerPropertyType::Boolean);
        nativeProps.Insert(L"loop", ViewManagerPropertyType::Boolean);
        nativeProps.Insert(L"speed", ViewManagerPropertyType::Number);
        nativeProps.Insert(L"sourceName", ViewManagerPropertyType::String);
        nativeProps.Insert(L"sourceJson", ViewManagerPropertyType::String);
        nativeProps.Insert(L"imageAssetsFolder", ViewManagerPropertyType::String);
        nativeProps.Insert(L"colorFilters", ViewManagerPropertyType::Array);

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

                if (propertyName == "autoPlay") {
                    control.AutoPlay(propertyValue.AsBoolean());
                }
                else if (propertyName == "loop") {
                    control.Loop(propertyValue.AsBoolean());
                }
                else if (propertyName == "speed") {
                    control.Speed(propertyValue.AsDouble());
                }
                else if (propertyName == "progress") {
                    control.SetProgress(propertyValue.AsDouble());
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
                else if (propertyName == "sourceName") {
                    auto sourceName = ReadValue<std::optional<std::wstring>>(propertyValue);
                    auto source = m_lottieSourceProvider.GetSourceFromName(sourceName.value_or(L""));
                    control.Source(source);
                }
                else if (propertyName == "sourceJson") {
                    // Currently unsupported by WinUI 2.x without involving .NET Framework
                }
                else if (propertyName == "imageAssetsFolder") {
                    
                }
                else if (propertyName == "colorFilters") {

                }
            }
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
                auto from = commandArgsReader.GetInt64();
                auto to = commandArgsReader.GetInt64();
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


    // IViewManagerWithExportedEventTypeConstants
    winrt::Microsoft::ReactNative::ConstantProviderDelegate LottieAnimationViewManager::ExportedCustomBubblingEventTypeConstants() noexcept
    {
        return nullptr;
    }

    winrt::Microsoft::ReactNative::ConstantProviderDelegate LottieAnimationViewManager::ExportedCustomDirectEventTypeConstants() noexcept
    {
        return [](IJSValueWriter const& constantWriter) {
            WriteCustomDirectEventTypeConstant(constantWriter, "onAnimationFinish", "onAnimationFinish");
        };
    }
}