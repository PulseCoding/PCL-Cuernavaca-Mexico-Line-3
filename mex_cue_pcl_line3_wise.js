var fs = require('fs');
var modbus = require('jsmodbus');
var PubNub = require('pubnub');
try {
	var secPubNub = 60 * 4 + 55;
	var BottleSorterct = null,
		BottleSorterresults = null,
		CntOutBottleSorter = null,
		BottleSorteractual = 0,
		BottleSortertime = 0,
		BottleSortersec = 0,
		BottleSorterflagStopped = false,
		BottleSorterstate = 0,
		BottleSorterspeed = 0,
		BottleSorterspeedTemp = 0,
		BottleSorterflagPrint = 0,
		BottleSortersecStop = 0,
		BottleSorterdeltaRejected = null,
		BottleSorterONS = false,
		BottleSortertimeStop = 60, //NOTE: Timestop
		BottleSorterWorktime = 0.98,
		BottleSorterflagRunning = false;
	var Fillerct = null,
		Fillerresults = null,
		CntInFiller = null,
		CntOutFiller = null,
		Filleractual = 0,
		Fillertime = 0,
		Fillersec = 0,
		FillerflagStopped = false,
		Fillerstate = 0,
		Fillerspeed = 0,
		FillerspeedTemp = 0,
		FillerflagPrint = 0,
		FillersecStop = 0,
		FillerdeltaRejected = null,
		FillerONS = false,
		FillertimeStop = 60, //NOTE: Timestop
		FillerWorktime = 0.99, //NOTE: Intervalo de tiempo en minutos para actualizar el log
		FillerflagRunning = false,
		FillerRejectFlag = false,
		FillerReject,
		FillerVerify = (function() {
			try {
				FillerReject = fs.readFileSync('FillerRejected.json')
				if (FillerReject.toString().indexOf('}') > 0 && FillerReject.toString().indexOf('{\"rejected\":') != -1) {
					FillerReject = JSON.parse(FillerReject)
				} else {
					throw 12121212
				}
			} catch (err) {
				if (err.code == 'ENOENT' || err == 12121212) {
					fs.writeFileSync('FillerRejected.json', '{"rejected":0}') //NOTE: Change the object to what it usually is.
					FillerReject = {
						rejected: 0
					}
				}
			}
		})()
	var BallDispenser = 0,
		CapDispenser = 0;
	var Coderct = null,
		Coderresults = null,
		CntInCoder = null,
		CntOutCoder = null,
		Coderactual = 0,
		Codertime = 0,
		Codersec = 0,
		CoderflagStopped = false,
		Coderstate = 0,
		Coderspeed = 0,
		CoderspeedTemp = 0,
		CoderflagPrint = 0,
		CodersecStop = 0,
		CoderdeltaRejected = null,
		CoderONS = false,
		CodertimeStop = 60, //NOTE: Timestop
		CoderWorktime = 0.95, //NOTE: Intervalo de tiempo en minutos para actualizar el log
		CoderflagRunning = false,
		CoderRejectFlag = false,
		CoderReject,
		CoderVerify = (function() {
			try {
				CoderReject = fs.readFileSync('CoderRejected.json')
				if (CoderReject.toString().indexOf('}') > 0 && CoderReject.toString().indexOf('{\"rejected\":') != -1) {
					CoderReject = JSON.parse(CoderReject)
				} else {
					throw 12121212
				}
			} catch (err) {
				if (err.code == 'ENOENT' || err == 12121212) {
					fs.writeFileSync('CoderRejected.json', '{"rejected":0}') //NOTE: Change the object to what it usually is.
					CoderReject = {
						rejected: 0
					}
				}
			}
		})();
	var Labellerct = null,
		Labellerresults = null,
		CntInLabeller = null,
		CntOutLabeller = null,
		Labelleractual = 0,
		Labellertime = 0,
		Labellersec = 0,
		LabellerflagStopped = false,
		Labellerstate = 0,
		Labellerspeed = 0,
		LabellerspeedTemp = 0,
		LabellerflagPrint = 0,
		LabellersecStop = 0,
		LabellerdeltaRejected = null,
		LabellerONS = false,
		LabellertimeStop = 60, //NOTE: Timestop
		LabellerWorktime = 0.95, //NOTE: Intervalo de tiempo en minutos para actualizar el log
		LabellerflagRunning = false,
		LabellerRejectFlag = false,
		LabellerReject,
		LabellerVerify = (function() {
			try {
				LabellerReject = fs.readFileSync('LabellerRejected.json')
				if (LabellerReject.toString().indexOf('}') > 0 && LabellerReject.toString().indexOf('{\"rejected\":') != -1) {
					LabellerReject = JSON.parse(LabellerReject)
				} else {
					throw 12121212
				}
			} catch (err) {
				if (err.code == 'ENOENT' || err == 12121212) {
					fs.writeFileSync('LabellerRejected.json', '{"rejected":0}') //NOTE: Change the object to what it usually is.
					LabellerReject = {
						rejected: 0
					}
				}
			}
		})();
	var CaseFormerct = null,
		CaseFormerresults = null,
		CntInCaseFormer = null,
		CntOutCaseFormer = null,
		CaseFormeractual = 0,
		CaseFormertime = 0,
		CaseFormersec = 0,
		CaseFormerflagStopped = false,
		CaseFormerstate = 0,
		CaseFormerspeed = 0,
		CaseFormerspeedTemp = 0,
		CaseFormerflagPrint = 0,
		CaseFormersecStop = 0,
		CaseFormerdeltaRejected = null,
		CaseFormerONS = false,
		CaseFormertimeStop = 60, //NOTE: Timestop
		CaseFormerWorktime = 0.98, //NOTE: Intervalo de tiempo en minutos para actualizar el log
		CaseFormerflagRunning = false;
	var CasePackerct = null,
		CasePackerresults = null,
		CntInCasePacker = null,
		CntOutCasePacker = null,
		CasePackeractual = 0,
		CasePackertime = 0,
		CasePackersec = 0,
		CasePackerflagStopped = false,
		CasePackerstate = 0,
		CasePackerspeed = 0,
		CasePackerspeedTemp = 0,
		CasePackerflagPrint = 0,
		CasePackersecStop = 0,
		CasePackerdeltaRejected = null,
		CasePackerONS = false,
		CasePackertimeStop = 60, //NOTE: Timestop
		CasePackerWorktime = 0.95, //NOTE: Intervalo de tiempo en minutos para actualizar el log
		CasePackerflagRunning = false,
		CasePackerRejectFlag = false,
		CasePackerReject,
		CasePackerVerify = (function() {
			try {
				CasePackerReject = fs.readFileSync('CasePackerRejected.json')
				if (CasePackerReject.toString().indexOf('}') > 0 && CasePackerReject.toString().indexOf('{\"rejected\":') != -1) {
					CasePackerReject = JSON.parse(CasePackerReject)
				} else {
					throw 12121212
				}
			} catch (err) {
				if (err.code == 'ENOENT' || err == 12121212) {
					fs.writeFileSync('CasePackerRejected.json', '{"rejected":0}') //NOTE: Change the object to what it usually is.
					CasePackerReject = {
						rejected: 0
					}
				}
			}
		})();
	var CheckWeigherct = null,
		CheckWeigherresults = null,
		CntInCheckWeigher = null,
		CntOutCheckWeigher = null,
		CheckWeigheractual = 0,
		CheckWeighertime = 0,
		CheckWeighersec = 0,
		CheckWeigherflagStopped = false,
		CheckWeigherstate = 0,
		CheckWeigherspeed = 0,
		CheckWeigherspeedTemp = 0,
		CheckWeigherflagPrint = 0,
		CheckWeighersecStop = 0,
		CheckWeigherdeltaRejected = null,
		CheckWeigherONS = false,
		CheckWeighertimeStop = 60, //NOTE: Timestop
		CheckWeigherWorktime = 0.98, //NOTE: Intervalo de tiempo en minutos para actualizar el log
		CheckWeigherflagRunning = false,
		CntRejCheckWeigher = null;
	var CntOutEOL = null,
		secEOL = 0;
	var publishConfig;
	var intId1, intId2, intId3;
	var files = fs.readdirSync("C:/PULSE/L3_LOGS/"); //Leer documentos
	var text2send = []; //Vector a enviar
	var i = 0;
	var pubnub = new PubNub({
		publishKey: "pub-c-8d024e5b-23bc-4ce8-ab68-b39b00347dfb",
		subscribeKey: "sub-c-c3b3aa54-b44b-11e7-895e-c6a8ff6a3d85",
		uuid: "Cue_PCL_LINE3"
	});


	var senderData = function() {
		pubnub.publish(publishConfig, function(status, response) {});
	}


	var client1 = modbus.client.tcp.complete({
		'host': "192.168.10.96",
		'port': 502,
		'autoReconnect': true,
		'timeout': 60000,
		'logEnabled': true,
		'reconnectTimeout': 30000
	});
	var client2 = modbus.client.tcp.complete({
		'host': "192.168.10.97",
		'port': 502,
		'autoReconnect': true,
		'timeout': 60000,
		'logEnabled': true,
		'reconnectTimeout': 30000
	});
	var client3 = modbus.client.tcp.complete({
		'host': "192.168.10.98",
		'port': 502,
		'autoReconnect': true,
		'timeout': 60000,
		'logEnabled': true,
		'reconnectTimeout': 30000
	});
} catch (err) {
	fs.appendFileSync("error_declarations.log", err + '\n');
}


try {
	client1.connect();
	client2.connect();
	client3.connect();
} catch (err) {
	fs.appendFileSync("error_connection.log", err + '\n');
}
try {

	/*----------------------------------------------------------------------------------BottleSorter-------------------------------------------------------------------------------------------*/

	var joinWord = function(num1, num2) {
		var bits = "00000000000000000000000000000000";
		var bin1 = num1.toString(2),
			bin2 = num2.toString(2),
			newNum = bits.split("");

		for (i = 0; i < bin1.length; i++) {
			newNum[31 - i] = bin1[(bin1.length - 1) - i];
		}
		for (i = 0; i < bin2.length; i++) {
			newNum[15 - i] = bin2[(bin2.length - 1) - i];
		}
		bits = newNum.join("");
		return parseInt(bits, 2);
	};
	setInterval(function() {
		//PubNub --------------------------------------------------------------------------------------------------------------------
		if (secPubNub >= 60 * 5) {

			var idle = function() {
				i = 0;
				text2send = [];
				for (var k = 0; k < files.length; k++) { //Verificar los archivos
					var stats = fs.statSync("C:/PULSE/L3_LOGS/" + files[k]);
					var mtime = new Date(stats.mtime).getTime();
					if (mtime < (Date.now() - (15 * 60 * 1000)) && files[k].indexOf("serialbox") == -1) {
						flagInfo2Send = 1;
						text2send[i] = files[k];
						i++;
					}
				}
			};
			secPubNub = 0;
			idle();
			publishConfig = {
				channel: "Cue_PCL_Monitor",
				message: {
					line: "3",
					tt: Date.now(),
					machines: text2send

				}
			};
			senderData();
		}
		secPubNub++;
		//PubNub --------------------------------------------------------------------------------------------------------------------
	}, 1000);



	client1.on('connect', function(err) {
		intId1 =
			setInterval(function() {
				client1.readHoldingRegisters(0, 16).then(function(resp) {
					CntOutBottleSorter = joinWord(resp.register[0], resp.register[1]);
					CntInFiller = joinWord(resp.register[2], resp.register[3]);
					BallDispenser = joinWord(resp.register[4], resp.register[5]);
					CntOutFiller = joinWord(resp.register[6], resp.register[7]);
					CapDispenser = joinWord(resp.register[8], resp.register[9]);
					//------------------------------------------BottleSorter----------------------------------------------
					BottleSorterct = CntOutBottleSorter // NOTE: igualar al contador de salida
					if (!BottleSorterONS && BottleSorterct) {
						BottleSorterspeedTemp = BottleSorterct
						BottleSortersec = Date.now()
						BottleSorterONS = true
						BottleSortertime = Date.now()
					}
					if (BottleSorterct > BottleSorteractual) {
						if (BottleSorterflagStopped) {
							BottleSorterspeed = BottleSorterct - BottleSorterspeedTemp
							BottleSorterspeedTemp = BottleSorterct
							BottleSortersec = Date.now()
							BottleSorterdeltaRejected = null
							BottleSorterRejectFlag = false
							BottleSortertime = Date.now()
						}
						BottleSortersecStop = 0
						BottleSorterstate = 1
						BottleSorterflagStopped = false
						BottleSorterflagRunning = true
					} else if (BottleSorterct == BottleSorteractual) {
						if (BottleSortersecStop == 0) {
							BottleSortertime = Date.now()
							BottleSortersecStop = Date.now()
						}
						if ((Date.now() - (BottleSortertimeStop * 1000)) >= BottleSortersecStop) {
							BottleSorterspeed = 0
							BottleSorterstate = 2
							BottleSorterspeedTemp = BottleSorterct
							BottleSorterflagStopped = true
							BottleSorterflagRunning = false
							BottleSorterflagPrint = 1
						}
					}
					BottleSorteractual = BottleSorterct
					if (Date.now() - 60000 * BottleSorterWorktime >= BottleSortersec && BottleSortersecStop == 0) {
						if (BottleSorterflagRunning && BottleSorterct) {
							BottleSorterflagPrint = 1
							BottleSortersecStop = 0
							BottleSorterspeed = BottleSorterct - BottleSorterspeedTemp
							BottleSorterspeedTemp = BottleSorterct
							BottleSortersec = Date.now()
						}
					}
					BottleSorterresults = {
						ST: BottleSorterstate,
						CPQO: CntOutBottleSorter,
						SP: BottleSorterspeed
					}
					if (BottleSorterflagPrint == 1) {
						for (var key in BottleSorterresults) {
							if (BottleSorterresults[key] != null && !isNaN(BottleSorterresults[key]))
								//NOTE: Cambiar path
								fs.appendFileSync('C:/PULSE/L3_LOGS/mex_pcl_BottleSorter_L3.log', 'tt=' + BottleSortertime + ',var=' + key + ',val=' + BottleSorterresults[key] + '\n')
						}
						BottleSorterflagPrint = 0
						BottleSortersecStop = 0
						BottleSortertime = Date.now()
					}
					//------------------------------------------BottleSorter----------------------------------------------
					//------------------------------------------Filler----------------------------------------------
					Fillerct = CntOutFiller // NOTE: igualar al contador de salida
					if (!FillerONS && Fillerct) {
						FillerspeedTemp = Fillerct
						Fillersec = Date.now()
						FillerONS = true
						Fillertime = Date.now()
					}
					if (Fillerct > Filleractual) {
						if (FillerflagStopped) {
							Fillerspeed = Fillerct - FillerspeedTemp
							FillerspeedTemp = Fillerct
							Fillersec = Date.now()
							FillerdeltaRejected = null
							FillerRejectFlag = false
							Fillertime = Date.now()
						}
						FillersecStop = 0
						Fillerstate = 1
						FillerflagStopped = false
						FillerflagRunning = true
					} else if (Fillerct == Filleractual) {
						if (FillersecStop == 0) {
							Fillertime = Date.now()
							FillersecStop = Date.now()
						}
						if ((Date.now() - (FillertimeStop * 1000)) >= FillersecStop) {
							Fillerspeed = 0
							Fillerstate = 2
							FillerspeedTemp = Fillerct
							FillerflagStopped = true
							FillerflagRunning = false
							if (CntInFiller - CntOutFiller - FillerReject.rejected != 0 && !FillerRejectFlag) {
								FillerdeltaRejected = CntInFiller - CntOutFiller - FillerReject.rejected
								FillerReject.rejected = CntInFiller - CntOutFiller
								fs.writeFileSync('FillerRejected.json', '{"rejected": ' + FillerReject.rejected + '}')
								FillerRejectFlag = true
							} else {
								FillerdeltaRejected = null
							}
							FillerflagPrint = 1
						}
					}
					Filleractual = Fillerct
					if (Date.now() - 60000 * FillerWorktime >= Fillersec && FillersecStop == 0) {
						if (FillerflagRunning && Fillerct) {
							FillerflagPrint = 1
							FillersecStop = 0
							Fillerspeed = Fillerct - FillerspeedTemp
							FillerspeedTemp = Fillerct
							Fillersec = Date.now()
						}
					}
					Fillerresults = {
						ST: Fillerstate,
						CPQI: CntInFiller,
						CPQO: CntOutFiller,
						CPQR: FillerdeltaRejected,
						SP: Fillerspeed
					}
					if (FillerflagPrint == 1) {
						for (var key in Fillerresults) {
							if (Fillerresults[key] != null && !isNaN(Fillerresults[key]))
								//NOTE: Cambiar path
								fs.appendFileSync('C:/PULSE/L3_LOGS/mex_pcl_Filler_L3.log', 'tt=' + Fillertime + ',var=' + key + ',val=' + Fillerresults[key] + '\n')
						}
						FillerflagPrint = 0
						FillersecStop = 0
						Fillertime = Date.now()
					}
					//------------------------------------------Filler----------------------------------------------
				}); //Cierre de lectura
			}, 1000);
	}); //Cierre de cliente

	client1.on('error', function(err) {
		clearInterval(intId1);
	});
	client1.on('close', function() {
		clearInterval(intId1);
	});

	client2.on('connect', function(err) {
		intId2 = setInterval(function() {
			client2.readHoldingRegisters(0, 16).then(function(resp) {
				//CntInCoder = joinWord(resp.register[0], resp.register[1]);
				CntInCoder = joinWord(resp.register[4], resp.register[5]);
				CntOutCoder = joinWord(resp.register[0], resp.register[1]);
				CntInLabeller = joinWord(resp.register[6], resp.register[7]);
				CntOutLabeller = joinWord(resp.register[4], resp.register[5]);
				//------------------------------------------Coder----------------------------------------------
				Coderct = CntOutCoder // NOTE: igualar al contador de salida
				if (!CoderONS && Coderct) {
					CoderspeedTemp = Coderct
					Codersec = Date.now()
					CoderONS = true
					Codertime = Date.now()
				}
				if (Coderct > Coderactual) {
					if (CoderflagStopped) {
						Coderspeed = Coderct - CoderspeedTemp
						CoderspeedTemp = Coderct
						Codersec = Date.now()
						CoderdeltaRejected = null
						CoderRejectFlag = false
						Codertime = Date.now()
					}
					CodersecStop = 0
					Coderstate = 1
					CoderflagStopped = false
					CoderflagRunning = true
				} else if (Coderct == Coderactual) {
					if (CodersecStop == 0) {
						Codertime = Date.now()
						CodersecStop = Date.now()
					}
					if ((Date.now() - (CodertimeStop * 1000)) >= CodersecStop) {
						Coderspeed = 0
						Coderstate = 2
						CoderspeedTemp = Coderct
						CoderflagStopped = true
						CoderflagRunning = false
						if (CntInCoder - CntOutCoder - CoderReject.rejected != 0 && !CoderRejectFlag) {
							CoderdeltaRejected = CntInCoder - CntOutCoder - CoderReject.rejected
							CoderReject.rejected = CntInCoder - CntOutCoder
							fs.writeFileSync('CoderRejected.json', '{"rejected": ' + CoderReject.rejected + '}')
							CoderRejectFlag = true
						} else {
							CoderdeltaRejected = null
						}
						CoderflagPrint = 1
					}
				}
				Coderactual = Coderct
				if (Date.now() - 60000 * CoderWorktime >= Codersec && CodersecStop == 0) {
					if (CoderflagRunning && Coderct) {
						CoderflagPrint = 1
						CodersecStop = 0
						Coderspeed = Coderct - CoderspeedTemp
						CoderspeedTemp = Coderct
						Codersec = Date.now()
					}
				}
				Coderresults = {
					ST: Coderstate,
					CPQI: CntInCoder,
					CPQO: CntOutCoder,
					CPQR: CoderdeltaRejected,
					SP: Coderspeed
				}
				if (CoderflagPrint == 1) {
					for (var key in Coderresults) {
						if (Coderresults[key] != null && !isNaN(Coderresults[key]))
							//NOTE: Cambiar path
							fs.appendFileSync('C:/PULSE/L3_LOGS/mex_pcl_Coder_L3.log', 'tt=' + Codertime + ',var=' + key + ',val=' + Coderresults[key] + '\n')
					}
					CoderflagPrint = 0
					CodersecStop = 0
					Codertime = Date.now()
				}
				//------------------------------------------Coder----------------------------------------------
				//------------------------------------------Labeller----------------------------------------------
				Labellerct = CntOutLabeller // NOTE: igualar al contador de salida
				if (!LabellerONS && Labellerct) {
					LabellerspeedTemp = Labellerct
					Labellersec = Date.now()
					LabellerONS = true
					Labellertime = Date.now()
				}
				if (Labellerct > Labelleractual) {
					if (LabellerflagStopped) {
						Labellerspeed = Labellerct - LabellerspeedTemp
						LabellerspeedTemp = Labellerct
						Labellersec = Date.now()
						LabellerdeltaRejected = null
						LabellerRejectFlag = false
						Labellertime = Date.now()
					}
					LabellersecStop = 0
					Labellerstate = 1
					LabellerflagStopped = false
					LabellerflagRunning = true
				} else if (Labellerct == Labelleractual) {
					if (LabellersecStop == 0) {
						Labellertime = Date.now()
						LabellersecStop = Date.now()
					}
					if ((Date.now() - (LabellertimeStop * 1000)) >= LabellersecStop) {
						Labellerspeed = 0
						Labellerstate = 2
						LabellerspeedTemp = Labellerct
						LabellerflagStopped = true
						LabellerflagRunning = false
						if (CntInLabeller - CntOutLabeller - LabellerReject.rejected != 0 && !LabellerRejectFlag) {
							LabellerdeltaRejected = CntInLabeller - CntOutLabeller - LabellerReject.rejected
							LabellerReject.rejected = CntInLabeller - CntOutLabeller
							fs.writeFileSync('LabellerRejected.json', '{"rejected": ' + LabellerReject.rejected + '}')
							LabellerRejectFlag = true
						} else {
							LabellerdeltaRejected = null
						}
						LabellerflagPrint = 1
					}
				}
				Labelleractual = Labellerct
				if (Date.now() - 60000 * LabellerWorktime >= Labellersec && LabellersecStop == 0) {
					if (LabellerflagRunning && Labellerct) {
						LabellerflagPrint = 1
						LabellersecStop = 0
						Labellerspeed = Labellerct - LabellerspeedTemp
						LabellerspeedTemp = Labellerct
						Labellersec = Date.now()
					}
				}
				Labellerresults = {
					ST: Labellerstate,
					CPQI: CntInLabeller,
					CPQO: CntOutLabeller,
					CPQR: LabellerdeltaRejected,
					SP: Labellerspeed
				}
				if (LabellerflagPrint == 1) {
					for (var key in Labellerresults) {
						if (Labellerresults[key] != null && !isNaN(Labellerresults[key]))
							//NOTE: Cambiar path
							fs.appendFileSync('C:/PULSE/L3_LOGS/mex_pcl_Labeler_L3.log', 'tt=' + Labellertime + ',var=' + key + ',val=' + Labellerresults[key] + '\n')
					}
					LabellerflagPrint = 0
					LabellersecStop = 0
					Labellertime = Date.now()
				}
				//------------------------------------------Labeller----------------------------------------------
			}); //Cierre de lectura

		}, 1000);
	}); //Cierre de cliente
	client2.on('error', function(err) {
		clearInterval(intId2);
	});
	client2.on('close', function() {
		clearInterval(intId2);
	});
	client3.on('connect', function(err) {
		intId3 = setInterval(function() {
			client3.readHoldingRegisters(0, 16).then(function(resp) {
				//CntOutCheckWeigher = joinWord(resp.register[0], resp.register[1]);
				CntRejCheckWeigher = joinWord(resp.register[0], resp.register[1]);
				CntOutCheckWeigher = joinWord(resp.register[8], resp.register[9]);
				CntInCheckWeigher = joinWord(resp.register[8], resp.register[9]) + joinWord(resp.register[0], resp.register[1]);
				//CntOutCasePacker = joinWord(resp.register[2], resp.register[3]);
				CntInCasePacker = joinWord(resp.register[4], resp.register[5]);
				CntOutCaseFormer = joinWord(resp.register[6], resp.register[7]);
				CntOutCasePacker = joinWord(resp.register[8], resp.register[9]) + joinWord(resp.register[0], resp.register[1]);
				CntOutEOL = joinWord(resp.register[8], resp.register[9]);
				//------------------------------------------CaseFormer----------------------------------------------
				CaseFormerct = CntOutCaseFormer // NOTE: igualar al contador de salida
				if (!CaseFormerONS && CaseFormerct) {
					CaseFormerspeedTemp = CaseFormerct
					CaseFormersec = Date.now()
					CaseFormerONS = true
					CaseFormertime = Date.now()
				}
				if (CaseFormerct > CaseFormeractual) {
					if (CaseFormerflagStopped) {
						CaseFormerspeed = CaseFormerct - CaseFormerspeedTemp
						CaseFormerspeedTemp = CaseFormerct
						CaseFormersec = Date.now()
						CaseFormerdeltaRejected = null
						CaseFormerRejectFlag = false
						CaseFormertime = Date.now()
					}
					CaseFormersecStop = 0
					CaseFormerstate = 1
					CaseFormerflagStopped = false
					CaseFormerflagRunning = true
				} else if (CaseFormerct == CaseFormeractual) {
					if (CaseFormersecStop == 0) {
						CaseFormertime = Date.now()
						CaseFormersecStop = Date.now()
					}
					if ((Date.now() - (CaseFormertimeStop * 1000)) >= CaseFormersecStop) {
						CaseFormerspeed = 0
						CaseFormerstate = 2
						CaseFormerspeedTemp = CaseFormerct
						CaseFormerflagStopped = true
						CaseFormerflagRunning = false
						CaseFormerflagPrint = 1
					}
				}
				CaseFormeractual = CaseFormerct
				if (Date.now() - 60000 * CaseFormerWorktime >= CaseFormersec && CaseFormersecStop == 0) {
					if (CaseFormerflagRunning && CaseFormerct) {
						CaseFormerflagPrint = 1
						CaseFormersecStop = 0
						CaseFormerspeed = CaseFormerct - CaseFormerspeedTemp
						CaseFormerspeedTemp = CaseFormerct
						CaseFormersec = Date.now()
					}
				}
				CaseFormerresults = {
					ST: CaseFormerstate,
					CPQO: CntOutCaseFormer,
					SP: CaseFormerspeed
				}
				if (CaseFormerflagPrint == 1) {
					for (var key in CaseFormerresults) {
						if (CaseFormerresults[key] != null && !isNaN(CaseFormerresults[key]))
							//NOTE: Cambiar path
							fs.appendFileSync('C:/PULSE/L3_LOGS/mex_pcl_CaseFormer_L3.log', 'tt=' + CaseFormertime + ',var=' + key + ',val=' + CaseFormerresults[key] + '\n')
					}
					CaseFormerflagPrint = 0
					CaseFormersecStop = 0
					CaseFormertime = Date.now()
				}
				//------------------------------------------CaseFormer----------------------------------------------
				//------------------------------------------CasePacker----------------------------------------------
				CasePackerct = CntOutCasePacker // NOTE: igualar al contador de salida
				if (!CasePackerONS && CasePackerct) {
					CasePackerspeedTemp = CasePackerct
					CasePackersec = Date.now()
					CasePackerONS = true
					CasePackertime = Date.now()
				}
				if (CasePackerct > CasePackeractual) {
					if (CasePackerflagStopped) {
						CasePackerspeed = CasePackerct - CasePackerspeedTemp
						CasePackerspeedTemp = CasePackerct
						CasePackersec = Date.now()
						CasePackerdeltaRejected = null
						CasePackerRejectFlag = false
						CasePackertime = Date.now()
					}
					CasePackersecStop = 0
					CasePackerstate = 1
					CasePackerflagStopped = false
					CasePackerflagRunning = true
				} else if (CasePackerct == CasePackeractual) {
					if (CasePackersecStop == 0) {
						CasePackertime = Date.now()
						CasePackersecStop = Date.now()
					}
					if ((Date.now() - (CasePackertimeStop * 1000)) >= CasePackersecStop) {
						CasePackerspeed = 0
						CasePackerstate = 2
						CasePackerspeedTemp = CasePackerct
						CasePackerflagStopped = true
						CasePackerflagRunning = false
						if (CntInCasePacker - CntOutCasePacker - CasePackerReject.rejected != 0 && !CasePackerRejectFlag) {
							CasePackerdeltaRejected = CntInCasePacker - CntOutCasePacker - CasePackerReject.rejected
							CasePackerReject.rejected = CntInCasePacker - CntOutCasePacker
							fs.writeFileSync('CasePackerRejected.json', '{"rejected": ' + CasePackerReject.rejected + '}')
							CasePackerRejectFlag = true
						} else {
							CasePackerdeltaRejected = null
						}
						CasePackerflagPrint = 1
					}
				}
				CasePackeractual = CasePackerct
				if (Date.now() - 60000 * CasePackerWorktime >= CasePackersec && CasePackersecStop == 0) {
					if (CasePackerflagRunning && CasePackerct) {
						CasePackerflagPrint = 1
						CasePackersecStop = 0
						CasePackerspeed = CasePackerct - CasePackerspeedTemp
						CasePackerspeedTemp = CasePackerct
						CasePackersec = Date.now()
					}
				}
				CasePackerresults = {
					ST: CasePackerstate,
					CPQI: CntInCasePacker,
					CPQO: CntOutCasePacker,
					//CPQR : CasePackerdeltaRejected,
					SP: CasePackerspeed
				}
				if (CasePackerflagPrint == 1) {
					for (var key in CasePackerresults) {
						if (CasePackerresults[key] != null && !isNaN(CasePackerresults[key]))
							//NOTE: Cambiar path
							fs.appendFileSync('C:/PULSE/L3_LOGS/mex_pcl_CasePacker_L3.log', 'tt=' + CasePackertime + ',var=' + key + ',val=' + CasePackerresults[key] + '\n')
					}
					CasePackerflagPrint = 0
					CasePackersecStop = 0
					CasePackertime = Date.now()
				}
				//------------------------------------------CasePacker----------------------------------------------
				//------------------------------------------CheckWeigher----------------------------------------------
				CheckWeigherct = CntOutCheckWeigher // NOTE: igualar al contador de salida
				if (!CheckWeigherONS && CheckWeigherct) {
					CheckWeigherspeedTemp = CheckWeigherct
					CheckWeighersec = Date.now()
					CheckWeigherONS = true
					CheckWeighertime = Date.now()
				}
				if (CheckWeigherct > CheckWeigheractual) {
					if (CheckWeigherflagStopped) {
						CheckWeigherspeed = CheckWeigherct - CheckWeigherspeedTemp
						CheckWeigherspeedTemp = CheckWeigherct
						CheckWeighersec = Date.now()
						CheckWeigherdeltaRejected = null
						CheckWeigherRejectFlag = false
						CheckWeighertime = Date.now()
					}
					CheckWeighersecStop = 0
					CheckWeigherstate = 1
					CheckWeigherflagStopped = false
					CheckWeigherflagRunning = true
				} else if (CheckWeigherct == CheckWeigheractual) {
					if (CheckWeighersecStop == 0) {
						CheckWeighertime = Date.now()
						CheckWeighersecStop = Date.now()
					}
					if ((Date.now() - (CheckWeighertimeStop * 1000)) >= CheckWeighersecStop) {
						CheckWeigherspeed = 0
						CheckWeigherstate = 2
						CheckWeigherspeedTemp = CheckWeigherct
						CheckWeigherflagStopped = true
						CheckWeigherflagRunning = false
						CheckWeigherflagPrint = 1
					}
				}
				CheckWeigheractual = CheckWeigherct
				if (Date.now() - 60000 * CheckWeigherWorktime >= CheckWeighersec && CheckWeighersecStop == 0) {
					if (CheckWeigherflagRunning && CheckWeigherct) {
						CheckWeigherflagPrint = 1
						CheckWeighersecStop = 0
						CheckWeigherspeed = CheckWeigherct - CheckWeigherspeedTemp
						CheckWeigherspeedTemp = CheckWeigherct
						CheckWeighersec = Date.now()
					}
				}
				CheckWeigherresults = {
					ST: CheckWeigherstate,
					CPQI: CntInCheckWeigher,
					CPQO: CntOutCheckWeigher,
					CPQR: CntRejCheckWeigher,
					SP: CheckWeigherspeed
				}
				if (CheckWeigherflagPrint == 1) {
					for (var key in CheckWeigherresults) {
						if (CheckWeigherresults[key] != null && !isNaN(CheckWeigherresults[key]))
							//NOTE: Cambiar path
							fs.appendFileSync('C:/PULSE/L3_LOGS/mex_pcl_CheckWeigher_L3.log', 'tt=' + CheckWeighertime + ',var=' + key + ',val=' + CheckWeigherresults[key] + '\n')
					}
					CheckWeigherflagPrint = 0
					CheckWeighersecStop = 0
					CheckWeighertime = Date.now()
				}
				//------------------------------------------CheckWeigher----------------------------------------------
				/*----------------------------------------------------------------------------------EOL----------------------------------------------------------------------------------*/
				if (secEOL >= 60 && CntOutEOL) {
					fs.appendFileSync("C:/PULSE/L3_LOGS/mex_pcl_eol_L3.log", "tt=" + Date.now() + ",var=EOL" + ",val=" + CntOutEOL + "\n");
					secEOL = 0;
				} else {
					secEOL++;
				}
				/*----------------------------------------------------------------------------------EOL----------------------------------------------------------------------------------*/

			}); //Cierre de lectura

		}, 1000);
	}); //Cierre de cliente
	client3.on('error', function(err) {
		clearInterval(intId3);
	});
	client3.on('close', function() {
		clearInterval(intId3);
	});
	//------------------------------Cerrar-código------------------------------
	var shutdown = function() {
		client1.close()
		client2.close()
		client3.close()
		process.exit(0)
	}

	process.on('SIGTERM', shutdown)
	process.on('SIGINT', shutdown)
	//------------------------------Cerrar-código------------------------------
} catch (err) {
	fs.appendFileSync("error.log", err + '\n');
}
