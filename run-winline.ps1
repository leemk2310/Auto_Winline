<#
.SYNOPSIS
    Universal Slot Game Winline Automation Runner
.DESCRIPTION
    Script PowerShell chạy tự động kiểm thử Winlines và xuất video MP4 cho mọi game Slot Cocos.
.EXAMPLE
    .\run-winline.ps1 -Url "https://neo-v2-play-staging.1kk6s8yq.com/slot/release/v1.1.3g-cheat/?game=n53989&cheat=1" -Data "test-data/winlines.json"
    .\run-winline.ps1 -Url "https://neo-v2-play-staging.1kk6s8yq.com/slot/release/v1.1.3g-cheat/?game=n53989&cheat=1" -Data "my_winlines.txt" -Delay 5
#>

param (
    [Alias("u")]
    [string]$Url = "",

    [Alias("d")]
    [string]$Data = "",

    [string]$Delay = "10",

    [string]$Viewport = "1440x900",

    [switch]$Headless,

    [Alias("g")]
    [string]$Filter = "",

    [Alias("o")]
    [string]$Out = "",

    [switch]$Help
)

if ($Help) {
    node "$PSScriptRoot\bin\runner.js" --help
    exit 0
}

$argsList = @("$PSScriptRoot\bin\runner.js")

if ($Url) {
    $argsList += @("-u", $Url)
}

if ($Data) {
    $argsList += @("-d", $Data)
}

if ($Delay) {
    $argsList += @("--delay", $Delay)
}

if ($Viewport) {
    $argsList += @("--viewport", $Viewport)
}

if ($Headless) {
    $argsList += "--headless"
}

if ($Filter) {
    $argsList += @("-g", $Filter)
}

if ($Out) {
    $argsList += @("-o", $Out)
}

& node $argsList

