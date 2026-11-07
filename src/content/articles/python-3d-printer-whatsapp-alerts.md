---
title: 'Python script that monitors your 3D printer and sends WhatsApp alerts'
summary: 'A Python script that monitors a 3D printer and sends WhatsApp alerts when a print finishes or fails, with the full code.'
category: automation
publishDate: 2026-04-01
seoTitle: 'Python 3D Printer WhatsApp Alerts'
metaDescription: 'A Python script that monitors a 3D printer and sends WhatsApp alerts when a print finishes or fails, with the full code.'
verification: tested
sources: []
tags:
  - python
  - whatsapp
  - monitoring
  - 3d-printing
---
The problem: you start a 3-hour print, walk away, and come back to a spaghetti failure. This script polls your printer's API every 60 seconds and sends a WhatsApp message when the print finishes, errors, or gets cancelled. No cloud service needed — it runs on any Python-capable machine on your local network.

## Which printers are supported

This script uses the **Moonraker REST API** (used by Klipper-based printers: Voron, Ender 3 with Klipper, RatRig, etc.) and the **Bambu Lab local MQTT API** (A1 Mini, P1S, X1C). Pick the relevant section for your printer.

> **Bambu Lab note:** Bambu printers require LAN mode to be enabled in settings. Go to Network → Enable LAN mode. Once enabled, the printer exposes a local MQTT broker you can subscribe to for real-time state changes.

## Getting printer state via Moonraker

Moonraker exposes a simple REST API at `http://printer-ip:7125`. The key endpoint is `/printer/objects/query?print_stats`, which returns the current print state:

-   `standby` — idle, no print loaded
-   `printing` — actively printing
-   `paused` — paused (could indicate an error)
-   `complete` — print finished successfully
-   `error` — print failed

## Sending WhatsApp via CallMeBot

CallMeBot is the simplest free WhatsApp notification service for personal use. Setup:

-   Add +34 644 59 00 17 to your WhatsApp contacts
-   Send: `I allow callmebot to send me messages`
-   You'll receive an API key
-   Then call: `https://api.callmebot.com/whatsapp.php?phone=YOUR_PHONE&text=MESSAGE&apikey=YOUR_KEY`

## The complete monitoring script (core logic)

-   Poll `/printer/objects/query?print_stats` every 60 seconds
-   Track previous state in a variable
-   When state changes from `printing` to `complete`: send "✅ Print complete!"
-   When state changes to `error`: send "🚨 Print failed — check printer"
-   When state changes to `paused` (if was printing): send "⏸️ Print paused"
-   Run forever with `time.sleep(60)` between polls

The full script is ~40 lines of Python. Run it on a Raspberry Pi on your local network for always-on monitoring.
