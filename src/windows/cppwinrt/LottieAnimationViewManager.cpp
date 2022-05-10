#include "pch.h"
#include "LottieAnimationViewManager.h"

#include "UI.Xaml.Controls.h"
#include "UI.Xaml.Media.h"
#include <winrt/Microsoft.UI.Xaml.Controls.h>

#include "NativeModules.h"

namespace winrt {
    using namespace winrt::Windows::Foundation;
    using namespace winrt::Windows::Foundation::Collections;
}
using namespace winrt::Microsoft::ReactNative;

REACT_STRUCT(ColorFilter);
struct ColorFilter {
    REACT_FIELD(keypath);
    std::wstring keypath;

    REACT_FIELD(color);
    std::wstring color;
};

namespace winrt::LottieReactNative::implementation {
    winrt::Windows::UI::Color HexToColor(std::wstring hex) {
        // For now, only support full #AARRGGBB or #RRGGBB hex, not web-style #RGB
        try {
            // Skip over any # prefix.
            const wchar_t* start = hex.length() > 0 && hex[0] == '#' ? hex.data() + 1 : hex.data();
            unsigned long value = std::stoul(start, nullptr, 16);

            uint8_t a = (value >> 24) & 0xFF;
            uint8_t r = (value >> 16) & 0xFF;
            uint8_t g = (value >> 8) & 0xFF;
            uint8_t b = (value >> 0) & 0xFF;

            return winrt::Windows::UI::Color{ a, r, g, b };
        }
        catch (...) {
            return {};
        }
    }


    LottieAnimationViewManager::LottieAnimationViewManager(winrt::LottieReactNative::ILottieSourceProvider lottieSourceProvider)
        : m_lottieSourceProvider(lottieSourceProvider) {
    }

    // IViewManager
    winrt::hstring LottieAnimationViewManager::Name() noexcept {
        return L"LottieAnimationView";
    }

    xaml::FrameworkElement LottieAnimationViewManager::CreateView() noexcept {
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
        xaml::FrameworkElement const& view,
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
                    auto stretch = xaml::Media::Stretch::Uniform;
                    if (resizeMode == "cover") {
                        stretch = xaml::Media::Stretch::UniformToFill;
                    }
                    else if (resizeMode == "stretch") {
                        stretch = xaml::Media::Stretch::Fill;
                    }
                    else if (resizeMode == "contain") {
                        stretch = xaml::Media::Stretch::Uniform;
                    }
                    else if (resizeMode == "center") {
                        stretch = xaml::Media::Stretch::None;
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
                    auto filters = winrt::single_threaded_map<winrt::hstring, winrt::Windows::UI::Color>();                    
                    auto filterData = ReadValue<std::vector<ColorFilter>>(propertyValue);
                    for (auto const& filterEntry : filterData) {
                        filters.Insert(filterEntry.keypath, HexToColor(filterEntry.color));
                    }
                    control.SetColorFilters(filters.GetView());
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
        xaml::FrameworkElement const& view,
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