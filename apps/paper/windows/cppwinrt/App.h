#pragma once
#include "App.xaml.g.h"

namespace winrt::Example::implementation
{
    struct App : AppT<App>
    {
        App() noexcept;
        void OnLaunched(winrt::Windows::ApplicationModel::Activation::LaunchActivatedEventArgs const &);

    private:
        using super = AppT<App>;
    };
}
