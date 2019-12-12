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
const sign = require("@mobileactions/ios-common");
const os = require("os");
const core = require("@actions/core");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check platform is macOS since demands are not evaluated on Hosted pools
            if (os.platform() !== 'darwin') {
                console.log('InstallRequiresMac');
            }
            else {
                let removeProfile = core.getInput('removeProfile').trim().toLowerCase() === 'true';
                if (removeProfile) {
                    let profileUUID = process.env['APPLE_PROV_PROFILE_UUID'];
                    if (profileUUID) {
                        yield sign.deleteProvisioningProfile(profileUUID);
                    }
                }
            }
        }
        catch (err) {
            core.warning(err);
        }
    });
}
run();
