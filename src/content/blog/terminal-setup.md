---
title: 'My Windows Terminal Setup: Cmder inside herdr'
description: My home base 👨‍💻 Linux commands, Neovim and all my coding agents, on Windows.
date: 20-10-2026
tags: [tech, setup]
---

Alright. So here's the deal. I'm a dev. You're most likely a dev too, or you want to become one. And I want to share my goated Windows terminal setup.

![[example-of-herdr-with-nvim.png|herdr with LazyVim open in one pane and a file tree on the side]]
![[example-of-herdr-claude.png|herdr running Claude Code in one pane and a shell in another]]

Lets begin by answering: Why is it so good?

- **Linux commands on Windows.** `ls`, `grep`, `cat`, all of it.
- **Agent sessions get saved.** Close the window, come back later, everything is still there.
- **Neovim that's as good as VS Code**, for a fraction of the RAM.
- **All my coding agents in one place.** Claude, Codex, opencode, pi, qwen, you name it.

Shoutout to the upperclassman who put me on to these tools (Thanks Patrick for the Herdr Suggestion). But getting them to work *together* on Windows was a shit ton of more work than I expected though, and I learned a lot along the way. So this post is half setup guide, half "here's everything that broke" and 10% the cool stuff you learn along the way!

## The pieces

Quick thing first, because it explains every bug later. A **terminal** and a **shell** are not the same thing.

- The **shell** reads your commands and runs them. `cmd.exe`, PowerShell and bash are shells. It can't draw anything. It only reads text in and writes text out.
- The **terminal** is the window. It draws the text, the colors and the cursor, and passes your keystrokes to the shell. Windows Terminal is a terminal. So is every herdr pane.

Now the three tools:

- **Cmder** isn't a shell either. It's a *bundle*: plain old `cmd.exe`, plus **clink** (which gives it bash-style history, tab completion and that `λ` prompt), plus Git's Unix tools like `ls`. A startup script called `init.bat` glues it all together. So "running Cmder" really just means "start `cmd.exe` and run `init.bat`".
- **herdr** is a workspace manager for your terminal, kind of like tmux (even though ive never used it, tmux is pretty famous). A background server owns all your panes, which is why sessions survive when you close the window. It also tracks your coding agents in a sidebar.
- **LazyVim** is a Neovim config that turns it into a full IDE out of the box.

## Step 1: Install Cmder

Download it from [cmder.app](https://cmder.app/) and unzip it somewhere. I put mine in `C:\Users\<you>\Cmder`.

Then add two **user** environment variables (search "environment variables" in the Start menu):

| Variable     | Value                                      |
| ------------ | ------------------------------------------ |
| `CMDER_ROOT` | `C:\Users\<you>\Cmder`                     |
| `ConEmuDir`  | `C:\Users\<you>\Cmder\vendor\conemu-maximus5` |

![[the-cmder-env-path-set.png|The two Cmder environment variables, next to the unzipped Cmder folder]]

Now you can open `Cmder.exe` and it just works:

![[cmder-showcase.png|Cmder running on its own, showing the λ prompt]]

## Step 2: Put Cmder inside Windows Terminal

Cmder's own window is fine, but the real power comes when you plug it into other terminals. In Windows Terminal, add a new profile and set the command line to:

```
cmd.exe /k %CMDER_ROOT%\vendor\init.bat
```

That's literally "start cmd, run Cmder's setup, and **k**eep the shell open" (`/c` would run it and **c**lose).

![[windows-terminal-setup.png|Windows Terminal settings with a Cmder profile and its command line]]

And now themes and colors are a BREEZE. Customize to your heart's content!!! For example I make it so I use FiraCode Nerd Font with Ligatures enabled... gives it that extra **good** vibe.

![[cmder-inside-new-windows-terminal.png|Cmder running inside Windows Terminal]]

## Step 3: Make herdr use Cmder

Install herdr from [herdr.dev](https://herdr.dev/) and run `herdr`. On Windows it starts with PowerShell by default. The [quick start guide](https://herdr.dev/docs/quick-start/) covers how to use it. It's super simple.

Now the serious stuff. You'll need four small files.

### 1. `config.toml`

Open `%APPDATA%\herdr` (that's `C:\Users\<you>\AppData\Roaming\herdr`) and create or edit `config.toml`:

```toml
onboarding = false

[ui.toast]
delivery = "herdr"

[ui]
host_cursor = "native" # so Neovim's cursor doesn't look weird inside herdr

[terminal]
default_shell = 'C:\Windows\System32\cmd.exe'

[theme]
name = "catppuccin"
auto_switch = false
```

The important line is `default_shell`. We swap PowerShell for plain `cmd.exe`, and then sneak Cmder in through the back door (next step).

Why not just paste the Windows Terminal command line here? I tried that first. But `default_shell` takes **one program path, no arguments**. herdr hands the whole string to Windows as the name of a program, so Windows goes looking for a program literally called `cmd.exe /k %CMDER_ROOT%\...` and obviously can't find it. This is a flaw in the herdr program itself that they have made it this way. Maybe next time ill try to fix the source code 😂 but for now we will work around this problem. We are going to cheat a bit.

### 2. `herdr_autorun.cmd`

`cmd.exe` has a little-known registry setting called **AutoRun**: a command that runs every time `cmd` starts. We direct it this script, (for ease of use) saved in the same folder as `%APPDATA%\herdr\herdr_autorun.cmd`

```bat
@echo off
:: Only run in a herdr pane's own interactive cmd (no /c or /k), once per pane.
if not "%CMDCMDLINE:/c=%"=="%CMDCMDLINE%" exit /b
if not "%CMDCMDLINE:/k=%"=="%CMDCMDLINE%" exit /b
if "%HERDR_CMDER_PANE%"=="%HERDR_PANE_ID%" exit /b
set "HERDR_CMDER_PANE=%HERDR_PANE_ID%"
:: The herdr server carries CMDER_CONFIGURED=1, which makes init.bat skip its PATH setup
set CMDER_CONFIGURED=
if not defined CMDER_ROOT set "CMDER_ROOT=%USERPROFILE%\Cmder"
:: Each pane gets its own TEMP folder so panes restoring at once don't clash
set "HERDR_OLD_TEMP=%TEMP%"
set "TEMP=%TEMP%\herdr-cmder-%HERDR_PANE_ID::=-%"
md "%TEMP%" 2>nul
call "%CMDER_ROOT%\vendor\init.bat"
rd /s /q "%TEMP%" 2>nul
set "TEMP=%HERDR_OLD_TEMP%"
set HERDR_OLD_TEMP=
```

In plain English:

- **Skip scripts.** If `cmd` was started with `/c` or `/k` (some program running a `.bat` file), bail out. Only the shell herdr opens for you gets Cmder.
- **Once per pane.** If Cmder is already set up in this pane, don't do it again.
- **Force a full setup.** Clear `CMDER_CONFIGURED` so Cmder actually builds its `PATH` (more on this bug below).
- **Run Cmder's `init.bat`**, with a temp folder just for this pane.

### 3. Turn on AutoRun

Run this once:

```bat
reg add "HKCU\Software\Microsoft\Command Processor" /v AutoRun /t REG_EXPAND_SZ /d "if defined HERDR_PANE_ID call %APPDATA%\herdr\herdr_autorun.cmd" /f
```

The good news: this only runs when `HERDR_PANE_ID` exists, and that's only set inside herdr (basicaly only run when its detected inside herdr). Your normal `cmd` stays completely untouched.

### 4. `herdr_cwd.lua`

So another problem that occured in this setup was when you open herdr and play around and then close and then reopen, the terminal does not always open in the right path, and god forbid you had an agent open, cause then the agent is opened in the user profile COMPLETELY wrong. So to fix that we add this file.
Without this, you `cd` somewhere and herdr still thinks you're in your home folder. Then new panes open in the wrong place and the workspace names are wrong. Create `%CMDER_ROOT%\config\herdr_cwd.lua` Its a setting for cmder to take a prompt input (The setup commands that herdr stores for its session) and run it properly without breaking

```lua
if os.getenv("HERDR_ENV") then
    local p = clink.promptfilter(1)
    function p:filter(prompt)
        return "\027]7;" .. os.getcwd() .. "\007" .. prompt
    end
end
```

Every time the prompt shows up, this quietly tells herdr "hey, I'm in `C:\whatever` now". It uses an invisible escape code, so your prompt looks exactly the same. Clink loads every `.lua` file in Cmder's `config` folder automatically, and Cmder updates never touch that folder.

### Bonus: make the λ visible

Last fix. Inside herdr my `λ` not at all shown. And python virtual environments as well were invisible. Cmder draws it in *bold black*. Windows Terminal turns bold black into gray, but herdr doesn't, so it's black on black. In `%CMDER_ROOT%\config\cmder_prompt_config.lua`, change one line:

```lua
lamb_color = "\x1b[90m" -- bright black, i.e. gray everywhere
```

And that's IT!!! Open a new herdr pane and you've got Cmder.

## What broke along the way

None of this worked the first time. Here's what went wrong, roughly in order.

**1. Panes wouldn't even open.** I pasted the Windows Terminal command line into `default_shell`, and herdr's log showed Windows looking for a program named, literally, `"cmd.exe /k %CMDER_ROOT%\vendor\init.bat"`. Pointing it straight at `init.bat` didn't work either. Windows runs a `.bat` with `cmd /c` (run and close), so the pane opened, ran setup, and died 0.4 seconds later. My first fix was a wrapper `.bat` that launched `cmd /k init.bat` but there were MANY other bugs to fix so with time that was discarded.

**2. herdr lost track of `cd`.** With the wrapper, `cd` worked but herdr still thought I was in my home folder. herdr is open source, so I read the code. On Windows it reads the current folder of the process it started *directly*, which was my wrapper, and the wrapper never moves. The real shell was one level down where herdr never looked. The fix was to make the shell *tell* herdr where it is, which is the Lua script above.

**3. `ls` didn't exist.** This one was sneaky. The herdr server had been started from a Cmder window once, so it carried Cmder's environment variables, including `CMDER_CONFIGURED=1`. Every pane inherits the server's environment, so `init.bat` thought "already set up" and so "skip setup", and never added Git's Unix tools to `PATH`. The fix is that one `set CMDER_CONFIGURED=` line that forces Cmder to initialize everything properly.

**4. Agents reopened in the wrong project.** When herdr restores a session it reopens each pane in its saved folder and resumes the agent there (`claude --resume ...`). But that saved folder also comes from the *direct* process, so with the wrapper it was always the folder the pane was born in. My agents kept waking up in the wrong project! That's why I ditched the wrapper and switched to the AutoRun trick: now `cmd.exe` *is* the direct process, so the folder herdr saves is the real one.

## What I learned

- **Read the log before guessing.** Both spawn failures were explained by one log line each.
- **Know which program handles what.** `%VAR%` is expanded by `cmd`, not by Windows itself. A `.bat` file always runs through `cmd /c`. Most of this was just finding the right layer.
- **If it's open source, read the code.** "Something's off with cd" turned into "oh, it only checks the direct child process" after a few file reads.
- **Child processes inherit a snapshot of their parent's environment.** A long-running server started from a weird shell carries that shell's variables forever.
- **Reproduce the bug where it actually happens.** The `ls` bug was invisible from my Git Bash window because its `PATH` hid the problem.

## Undo it

If you ever want out:

```bat
reg delete "HKCU\Software\Microsoft\Command Processor" /v AutoRun /f
```

Then delete the `default_shell` line from `config.toml`, and herdr goes back to PowerShell.

<details>
<summary>Deep dive: how the shell "tells" herdr where it is</summary>

Everything between the terminal and the shell is just a stream of bytes. So how does a program say "make this red" without the word "red" showing up on screen? With **escape sequences**: the ESC byte (`\x1b`) followed by a short command that the terminal acts on instead of printing.

- `ESC[31m` means "red text from here on".
- `ESC]7;C:\path BEL` means "my current folder is now `C:\path`". This one's called **OSC 7**.

The Lua script just glues an OSC 7 in front of the prompt every time it's drawn. herdr reads it, updates the pane's folder, and draws nothing.

Fun detail: clink can already send the ConEmu version of this (`OSC 9;9`), but only when it detects Windows Terminal or ConEmu. herdr deliberately hides the Windows Terminal marker from panes, so clink stays quiet. Hence the custom script.

</details>

One last tip: install [LazyVim](https://www.lazyvim.org/) on top of all this and you basically have a whole IDE in your terminal. Enjoy!


> PS: This was my first tech blog that I made. I hope you liked it, if you have any suggestions do share, I would love to hear them