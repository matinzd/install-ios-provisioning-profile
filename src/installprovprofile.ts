import os = require('os');
import core = require('@actions/core');
import io = require('@actions/io');
const exec = require('@actions/exec');
import ioutils = require('./io-utils');
import sign = require('./ios-signing');
import fs = require('fs');
import path = require('path');

async function run() {
   await installProvisioningProfileTask();
}

export async function installProvisioningProfileTask() {
    try {        
        // Check platform is macOS since demands are not evaluated on Hosted pools
        if (os.platform() !== 'darwin') {
            core.error('Install requires Mac runtime')
            throw new Error('InstallRequiresMac');
        }

        // BASE64 encoded .mobileprovision passed through GitHub secret
        let encodedProfileData = core.getInput('encoded-profile');

        // Temporary file locations
        let provisioningProfileFile = '/tmp/profile.mobileprovision';
        let base64ProfileFile = '/tmp/profile.base64';
        
        if (encodedProfileData) {
           fs.writeFile(base64ProfileFile, encodedProfileData, async (err) => {
                if (err) {
                    core.error('could not write base64 provisioning file to /tmp');
                }
                else {
                    let base64Cmd = await io.which('base64', true);
                    await exec.exec(base64Cmd, ['-d', '-i', base64ProfileFile, '-o', provisioningProfileFile]);

                    // remove base64 file
                    io.rmRF(base64ProfileFile);
                    core.debug('Removed base64 version of provisioning profile.');

                    if (ioutils.exists(provisioningProfileFile) && ioutils.stats(provisioningProfileFile).isFile()) {
                        core.debug('Found provisioning profile to install');
                        try
                        {
                            const info = await sign.installProvisioningProfile(provisioningProfileFile);
                            
                            // set the provisioning profile output variable.
                            core.debug('setting environment variables privisioningProfileUuid & Name');
                            core.setOutput('APPLE_PROV_PROFILE_UUID', info.provProfileUUID);
                            core.exportVariable('provisioningProfileUuid', info.provProfileUUID);
                            core.exportVariable('provisioningProfileName', info.provProfileName || '');

                        } catch (err) {
                            core.error(err);
                        } finally {
                            // remove temporary file
                            io.rmRF(provisioningProfileFile);
                            core.debug('removed provisioning profile from /tmp');
                        }
                    }
                    else {
                        core.error('Input Provisioning Profile Not Found at ' + provisioningProfileFile);
                        throw new Error('InputProvisioningProfileNotFound');
                    }
                }
            });
           
        } else {
            core.error('Required secret PROVISIONING_PROFILE is not defined.');
            throw new Error('ProvisioningProfileSecretNotDefined');
        }
    } catch (err) {
        core.setFailed("Task Failed");
    }
}

run();