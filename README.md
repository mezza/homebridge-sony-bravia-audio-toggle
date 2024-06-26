<p align="center">

<img src="https://github.com/homebridge/branding/raw/latest/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>

<span align="center">

# Sony Bravia Audio Toggle Homebridge plugin

</span>

This is a Homebridge plugin to solve a specific issue with my 2017 Sony Bravia TV (KD49x8305) and a Wiim Amplifier. Sadly, despite being connected to the amplifier using HDMI and the TV reporting that it is set to output sound to the amp, it regularly doesn't! This requires me to manually toggle the audio output source using the IR remote control and the painfully slow TV menu (so primitive!).

It's based on the [Homebridge template plugin](https://github.com/homebridge/homebridge-plugin-template), and there's only one commit so you can see what was done.

You will have to ensure you have enable IP Control and you can read more about the API here: https://pro-bravia.sony.net/develop/integrate/ip-control/index.html

It's really unlikely I'll have time to maintain this so caveat emptor!

## Installing and using

Install using Homebridge UI, and then for the plugin settings specify:

1. *Name* - how you want this to appear in Homebridge/Homekit
2. *IP Address* - the IP address of your TV
3. *PSK* - the Private Shared Key you've setup on your TV. Note, the API uses HTTP not HTTPS so don't expect this to be encrypted in transit
  
The *Default TV audio output value* and *Desired audio system output value* can be left as defaults, and are return values from the API.