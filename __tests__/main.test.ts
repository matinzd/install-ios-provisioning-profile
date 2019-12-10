import * as path from 'path'
import core = require('@actions/core');
const exec = require('@actions/exec');
import ios = require('../src/installprovprofile');
import fs = require('fs');

test('Install provisioning profile', async() => {
    fs.readFile(path.join(__dirname, "testprovprofile.mobileprovision.base64"), "utf8", async (err, data) => {

        //Simulates file being stored as a GitHub secret
        core.exportVariable('INPUT_ENCODED-PROFILE', data);

        await ios.installProvisioningProfileTask(); 
      });
});


test('Check if provisioning profile installed correctly', async() => {
  
  fs.readFile(path.join(__dirname, "testprovprofile.mobileprovision.base64"), "utf8", async (err, data) => {

    //Simulates file being stored as a GitHub secret
    core.exportVariable('INPUT_ENCODED-PROFILE', data);

    await ios.installProvisioningProfileTask(); 

    let uuid = core.getInput('APPLE_PROV_PROFILE_UUID');
    let altUuid = core.getInput('provisioningProfileUuid');
    let name = core.getInput('provisioningProfileName');

    console.log("UUID: " + uuid);
    console.log("Alt UUID: " + altUuid);
    console.log("Name: " + name);
  });
});