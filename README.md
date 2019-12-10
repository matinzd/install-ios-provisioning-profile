# Install iOS Provisioning Profile

Use this action to install a provisioning profile during your iOS build. The profile is automatically removed post-build.

## Setup

This action requires that your provisioning profile be BASE64 encoded and placed in a secret in your project's GitHub repository.

To encode your profile:

```
base64 -i YOUR_PROVISIONING_FILE.mobileprovision -o FILENAME.base64
```

Then copy the contents of FILENAME.base64 to a secret in your mobile apps' GitHub repostitory. 

## Usage

In your project's action worksflow, add the install provisioning profile step prior to your app's build step.

```
steps:
- name: Install provisioning profile
  uses: mobileactions/iOSProvisioningProfile@1.0
  env:
    ENCODED-PROFILE: ${{ secrets.YOUR_SECRET_NAME }}
```

