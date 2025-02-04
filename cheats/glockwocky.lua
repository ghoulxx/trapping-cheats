--// Services
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local LocalPlayer = Players.LocalPlayer
local Camera = game.Workspace.CurrentCamera

--// ImGui Setup
local ImGui = loadstring(game:HttpGet("https://raw.githubusercontent.com/2vsecond/imgui/main/main.lua"))()
local Window = ImGui:CreateWindow("Trapping", Vector2.new(350, 350), Color3.fromRGB(0, 0, 255), Color3.fromRGB(0, 0, 0))

--// Config
local Config = {
    Fly_Enabled = false,
    Teleport_Enabled = false,
    NameHealthCheck = true,
    ESP_Enabled = true,
    Aimbot_Enabled = true,
    SilentAim_Enabled = true,
    Triggerbot_Enabled = false,
    Aimbot_Smoothness = 0.2,
    AimPart = "Head",
    AimKey = Enum.KeyCode.E,
    ToggleESPKey = Enum.KeyCode.F,
    TeamCheck = true,
    WallCheck = true
}

--// Function to check if a player is visible (Wall Check)
function IsVisible(Target)
    local Origin = Camera.CFrame.Position
    local _, OnScreen = Camera:WorldToViewportPoint(Target.Position)
    
    if OnScreen and Config.WallCheck then
        local RaycastParams = RaycastParams.new()
        RaycastParams.FilterDescendantsInstances = {LocalPlayer.Character}
        RaycastParams.FilterType = Enum.RaycastFilterType.Blacklist
        
        local RaycastResult = game.Workspace:Raycast(Origin, (Target.Position - Origin).Unit * 1000, RaycastParams)
        return RaycastResult == nil
    end
    return OnScreen
end

--// ESP Function
function DisplayNameAndHealth(Player)
    if not Config.NameHealthCheck then return end
    while Player.Character and Player.Character:FindFirstChild("Humanoid") do
        local Humanoid = Player.Character:FindFirstChild("Humanoid")
        if Humanoid then
            print("Player:", Player.Name, "| Health:", Humanoid.Health)
        end
        task.wait(1)
    end
end
function CreateESP(Player)
    if Player == LocalPlayer then return end
    
    local Highlight = Instance.new("Highlight")
    Highlight.Parent = game.CoreGui
    Highlight.FillColor = Color3.fromRGB(0, 0, 255)
    Highlight.OutlineColor = Color3.fromRGB(0, 0, 0)
    Highlight.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop

    local function UpdateESP()
        while Config.ESP_Enabled and Player.Character and Player.Character:FindFirstChild("HumanoidRootPart") do
            pcall(function()
                if Config.TeamCheck and Player.Team == LocalPlayer.Team then
                    Highlight.Enabled = false
                else
                    Highlight.Enabled = true
                    Highlight.Adornee = Player.Character
                end
            end)
            task.wait(0.1)
        end
        Highlight:Destroy()
    end

    coroutine.wrap(UpdateESP)()
    coroutine.wrap(function() DisplayNameAndHealth(Player) end)()
end

--// Aimbot Functions
function GetNearestPlayer()
    local NearestPlayer = nil
    local NearestDistance = math.huge

    for _, Player in pairs(Players:GetPlayers()) do
        if Player ~= LocalPlayer and (not Config.TeamCheck or Player.Team ~= LocalPlayer.Team) and Player.Character and Player.Character:FindFirstChild(Config.AimPart) then
            local TargetPart = Player.Character[Config.AimPart]
            if TargetPart and IsVisible(TargetPart) then
                local TargetPos = Camera:WorldToViewportPoint(TargetPart.Position)
                local MousePos = game.Players.LocalPlayer:GetMouse().Hit.p
                local Distance = (Vector2.new(TargetPos.X, TargetPos.Y) - Vector2.new(MousePos.X, MousePos.Y)).Magnitude

                if Distance < NearestDistance then
                    NearestDistance = Distance
                    NearestPlayer = Player
                end
            end
        end
    end
    return NearestPlayer
end

function Aimbot()
    if not Config.Aimbot_Enabled then return end
    local Target = GetNearestPlayer()

    if Target and Target.Character and Target.Character:FindFirstChild(Config.AimPart) then
        local TargetPos = Target.Character[Config.AimPart].Position
        Camera.CFrame = Camera.CFrame:Lerp(CFrame.new(Camera.CFrame.Position, TargetPos), Config.Aimbot_Smoothness)
    end
end

--// Silent Aim (Bullet Redirection)
hookmetamethod(game, "__namecall", function(Self, ...)
    local Args = {...}
    local Method = getnamecallmethod()

    if Method == "FindPartOnRayWithIgnoreList" and Config.SilentAim_Enabled then
        local Target = GetNearestPlayer()
        if Target and Target.Character and Target.Character:FindFirstChild(Config.AimPart) then
            Args[1] = Ray.new(Camera.CFrame.Position, (Target.Character[Config.AimPart].Position - Camera.CFrame.Position).unit * 1000)
        end
    end
    return oldNamecall(Self, unpack(Args))
end)

--// Triggerbot
RunService.RenderStepped:Connect(function()
    if Config.Triggerbot_Enabled then
        local Mouse = LocalPlayer:GetMouse()
        local Target = Mouse.Target

        if Target and Target.Parent and Players:GetPlayerFromCharacter(Target.Parent) then
            mouse1click()
        end
    end
end)

--// Fly Function
function Fly()
    if not Config.Fly_Enabled then return end
    local Character = LocalPlayer.Character
    if Character and Character:FindFirstChild("HumanoidRootPart") then
        local BodyVelocity = Instance.new("BodyVelocity")
        BodyVelocity.Velocity = Vector3.new(0, 50, 0)
        BodyVelocity.MaxForce = Vector3.new(4000, 4000, 4000)
        BodyVelocity.Parent = Character.HumanoidRootPart
        wait(5)
        BodyVelocity:Destroy()
    end
end

--// Teleport Function
function TeleportTo(targetPlayer)
    if not Config.Teleport_Enabled then return end
    if targetPlayer and targetPlayer.Character and targetPlayer.Character:FindFirstChild("HumanoidRootPart") then
        LocalPlayer.Character.HumanoidRootPart.CFrame = targetPlayer.Character.HumanoidRootPart.CFrame
    end
end

--// UI Setup
Window:AddToggle("ESP Enabled", function(Value)
    Config.ESP_Enabled = Value
end, Config.ESP_Enabled)

Window:AddToggle("Aimbot Enabled", function(Value)
    Config.Aimbot_Enabled = Value
end, Config.Aimbot_Enabled)

Window:AddToggle("Silent Aim Enabled", function(Value)
    Config.SilentAim_Enabled = Value
end, Config.SilentAim_Enabled)

Window:AddToggle("Triggerbot Enabled", function(Value)
    Config.Triggerbot_Enabled = Value
end, Config.Triggerbot_Enabled)

Window:AddToggle("Team Check", function(Value)
    Config.TeamCheck = Value
end, Config.TeamCheck)

Window:AddToggle("Wall Check", function(Value)
    Config.WallCheck = Value
end, Config.WallCheck)

Window:AddSlider("Aimbot Smoothness", 0, 1, function(Value)
    Config.Aimbot_Smoothness = Value
end, Config.Aimbot_Smoothness)

Window:AddDropdown("Aim Part", {"Head", "HumanoidRootPart"}, function(Value)
    Config.AimPart = Value
end, Config.AimPart)

Window:AddKeybind("Aim Key", function(Value)
    Config.AimKey = Value
end, Config.AimKey)

Window:AddKeybind("Toggle ESP Key", function(Value)
    Config.ToggleESPKey = Value
end, Config.ToggleESPKey)

Window:AddToggle("Name & Health Check", function(Value)
    Config.NameHealthCheck = Value
end, Config.NameHealthCheck)

Window:AddToggle("Fly Enabled", function(Value)
    Config.Fly_Enabled = Value
    Fly()
end, Config.Fly_Enabled)

Window:AddToggle("Teleport Enabled", function(Value)
    Config.Teleport_Enabled = Value
end, Config.Teleport_Enabled)

Window:Show()
