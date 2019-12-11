import sign = require('@mobileactions/ios-common');
import os = require('os');
import core = require('@actions/core');

async function run() {
    try {
        // Check platform is macOS since demands are not evaluated on Hosted pools
        if (os.platform() !== 'darwin') {
            console.log('InstallRequiresMac');
        } else {
            let removeProfile: boolean = core.getInput('removeProfile').trim().toLowerCase() === 'true';
            if (removeProfile) {
                let profileUUID: string | undefined = process.env['APPLE_PROV_PROFILE_UUID'];
                if (profileUUID) {
                    await sign.deleteProvisioningProfile(profileUUID);
                }
            }
        }
    } catch (err) {
        core.warning(err);
    }
}

run();