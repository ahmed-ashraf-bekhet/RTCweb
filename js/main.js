const constraints = window.constraints = {
          audio: true,
          video: true
        };
        
        navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        })
            .then(stream => {
                console.log('Got MediaStream:', stream);
            })
            .catch(error => {
                console.error('Error accessing media devices.', error);
            });

        function getConnectedDevices(type, callback) {
            navigator.mediaDevices.enumerateDevices()
                .then(devices => {
                    const filtered = devices.filter(device => device.kind === type);
                    callback(filtered);
                });
        }

        getConnectedDevices('videoinput', cameras => console.log('Cameras found', cameras));


        // Updates the select element with the provided set of cameras
        function updateCameraList(cameras) {
            const listElement = document.querySelector('select#availableCameras');
            listElement.innerHTML = '';
            cameras.map(camera => {
                const cameraOption = document.createElement('option');
                cameraOption.label = camera.label;
                cameraOption.value = camera.deviceId;
            }).forEach(cameraOption => listElement.add(cameraOption));
        }

        // Fetch an array of devices of a certain type
        async function getConnectedDevices(type) {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === type)
        }

        // Get the initial set of cameras connected
        const videoCameras = getConnectedDevices('videoinput');
        updateCameraList(videoCameras);

        // Listen for changes to media devices and update the list accordingly
        navigator.mediaDevices.addEventListener('devicechange', event => {
            const newCameraList = getConnectedDevices('video');
            updateCameraList(newCameraList);
        });


        async function getConnectedDevices(type) {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === type)
        }

        // Open camera with at least minWidth and minHeight capabilities
        async function openCamera(cameraId, minWidth, minHeight) {
            const constraints = {
                'audio': { 'echoCancellation': true },
                'video': {
                    'deviceId': cameraId,
                    'width': { 'min': minWidth },
                    'height': { 'min': minHeight }
                }
            }

            return await navigator.mediaDevices.getUserMedia(constraints);
        }

        const cameras = getConnectedDevices('videoinput');
        if (cameras && cameras.length > 0) {
            // Open first available video camera with a resolution of 1280x720 pixels
            const stream = openCamera(cameras[0].deviceId, 1280, 720);
        }

        async function playVideoFromCamera() {
            try {
                const constraints = { 'video': true, 'audio': true };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                const videoElement = document.querySelector('video#localVideo');
                videoElement.srcObject = stream;
            } catch (error) {
                console.error('Error opening video camera.', error);
            }
        }


        async function makeCall() {
            const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302'}] }
            const peerConnection = new RTCPeerConnection(configuration);
            signalingChannel.addEventListener('message', async message => {
                if (message.answer) {
                    const remoteDesc = new RTCSessionDescription(message.answer);
                    await peerConnection.setRemoteDescription(remoteDesc);
                }
            });
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            signalingChannel.send({ 'offer': offer });
        }

        const peerConnection = new RTCPeerConnection(configuration);
        signalingChannel.addEventListener('message', async message => {
            if (message.offer) {
                peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                signalingChannel.send({ 'answer': answer });
            }
        });

        peerConnection.addEventListener('icecandidate', event => {
            if (event.candidate) {
                signalingChannel.send({ 'new-ice-candidate': event.candidate });
            }
        });

        // Listen for remote ICE candidates and add them to the local RTCPeerConnection
        signalingChannel.addEventListener('message', async message => {
            if (message.iceCandidate) {
                try {
                    await peerConnection.addIceCandidate(message.iceCandidate);
                } catch (e) {
                    console.error('Error adding received ice candidate', e);
                }
            }
        });

        // Listen for connectionstatechange on the local RTCPeerConnection
        peerConnection.addEventListener('connectionstatechange', event => {
            if (peerConnection.connectionState === 'connected') {
                // Peers connected!
            }
        });