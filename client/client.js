/// <reference types="@altv/types-natives" />
/// <reference types="@altv/types-client" />
import alt from 'alt-client';
import * as native from 'natives';

const player = alt.Player.local;

let speedometr;
let speedometrObject;
let interval;

alt.on('enteredVehicle', (vehicle, seat) => {
    let speedoModel = 'prop_tv_flat_01_screen';
    let modelHash = native.getHashKey(speedoModel);
    let speedoTexture = 'script_rt_tvscreen';

    speedometrObject = native.createObjectNoOffset(
        modelHash,
        vehicle.pos.x,
        vehicle.pos.y,
        vehicle.pos.z,
        true,
        false,
        false
    );

    native.setEntityAlpha(speedometrObject, 240, false);

    native.attachEntityToEntity(
        speedometrObject,
        vehicle,
        native.getEntityBoneIndexByName(vehicle, 'door_pside_f'),
        -0.5,
        0.1,
        0.5,
        -60,
        240,
        25,
        false,
        false,
        false,
        false,
        0,
        true
    );

    native.setEntityCollision(speedometrObject, false, true);
    speedometr = new alt.WebView(
        'http://resource/client/systems/vehicle/speedometr/index.html',
        modelHash,
        speedoTexture
    );

    interval = alt.setInterval(() => {
        let color;
        let speed = (native.getEntitySpeed(vehicle.scriptID) * 3.6).toFixed();
        let maxSpeed = (native.getVehicleEstimatedMaxSpeed(vehicle) * 3.6).toFixed();

        if (speed > maxSpeed - 30) color = 'red';
        else if (speed > maxSpeed / 2 - 30) color = 'orange';
        else color = 'white';
        let health = native.getVehicleEngineHealth(vehicle);
        speedometr.emit('cef::speedometer:value', speed, color);
        speedometr.emit('cef::speedometer:engine', health / 100);
        speedometr.emit('cef::speedometer:speedo', (vehicle.rpm * 100).toFixed());
    }, 0);

    let fuel = 100;
    alt.setInterval(() => {
        fuel--;
        speedometr.emit('cef::speedometer:fuel', fuel);
    }, 500);
});

alt.on('leftVehicle', (vehicle, seat) => {
    if (interval) alt.clearInterval(interval);
    if (speedometr) speedometr.destroy();
    if (speedometrObject) native.deleteObject(speedometrObject);
});
