"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const core = require("@actions/core");
const io = require("@actions/io");
const exec = require('@actions/exec');
const sign = require("@mobileactions/ios-common");
const ioutils = require("@mobileactions/actions-common");
const fs = require("fs");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        yield installProvisioningProfileTask();
    });
}
function installProvisioningProfileTask() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check platform is macOS since demands are not evaluated on Hosted pools
            if (os.platform() !== 'darwin') {
                core.error('Install requires Mac runtime');
                throw new Error('InstallRequiresMac');
            }
            // BASE64 encoded .mobileprovision passed through GitHub secret
            let encodedProfileData = core.getInput('encoded-profile');
            // Temporary file locations
            let provisioningProfileFile = '/tmp/profile.mobileprovision';
            let base64ProfileFile = '/tmp/profile.base64';
            if (encodedProfileData) {
                fs.writeFile(base64ProfileFile, encodedProfileData, (err) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        core.error('could not write base64 provisioning file to /tmp');
                    }
                    else {
                        let base64Cmd = yield io.which('base64', true);
                        yield exec.exec(base64Cmd, ['-d', '-i', base64ProfileFile, '-o', provisioningProfileFile]);
                        // remove base64 file
                        io.rmRF(base64ProfileFile);
                        core.debug('Removed base64 version of provisioning profile.');
                        if (ioutils.exists(provisioningProfileFile) && ioutils.stats(provisioningProfileFile).isFile()) {
                            core.debug('Found provisioning profile to install');
                            try {
                                const info = yield sign.installProvisioningProfile(provisioningProfileFile);
                                // set the provisioning profile output variable.
                                core.debug('setting environment variables privisioningProfileUuid & Name');
                                core.setOutput('APPLE_PROV_PROFILE_UUID', info.provProfileUUID);
                                core.exportVariable('provisioningProfileUuid', info.provProfileUUID);
                                core.exportVariable('provisioningProfileName', info.provProfileName || '');
                            }
                            catch (err) {
                                core.error(err);
                            }
                            finally {
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
                }));
            }
            else {
                core.error('Required secret PROVISIONING_PROFILE is not defined.');
                throw new Error('ProvisioningProfileSecretNotDefined');
            }
        }
        catch (err) {
            core.setFailed("Task Failed");
        }
    });
}
exports.installProvisioningProfileTask = installProvisioningProfileTask;
run();
