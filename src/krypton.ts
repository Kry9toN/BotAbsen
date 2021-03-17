/*
 * This file is part of the KryPtoN Bot WA distribution (https://github.com/Kry9toN/KryPtoN-WhatsApp-Bot).
 * Copyright (c) 2021 Dhimas Bagus Prayoga.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import readline from 'readline'
import { Absen } from './utils/absen'
import { color } from './utils/color'
import path from 'path'
import fs from 'fs'
import maping from "./config/map.json";
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const absen = new Absen()

const dialog = `
Pilih salah satu aja:
1. Absen
2. Logout
0. Keluar
[Nomor]: `

function listCheck(listValue) {
    let dialog = color('\nHanya pilih yang tertera di bawah ini!\n', 'red')
    for (let list in listValue) {
        dialog += `${listValue[list]} `
    }
    console.log(dialog)
}

function pertanyaan() {
    rl.question(color(dialog, 'green'), (num) => {
        
        if (num == '1') {
            const pathSessions = path.join(__dirname, '../sessions/login.json')
            const previousSession: boolean = fs.existsSync(pathSessions)
            const listJurusan = Object.keys(maping).map(key => [key])
            if (!previousSession) {
                rl.question(color('Masukan username: ', 'yellow'), (username) => {
                    rl.question(color('Masukan password: ', 'yellow'), (pw) => {
                        rl.question(color('Jurusan: ', 'yellow'), (jurusan) => {
                            const mapJurusan = JSON.stringify(maping)
                            if (mapJurusan.includes(jurusan)) {
                                rl.question(color('Kelas: ', 'yellow'), (kelas) => {
                                    const listKelas = Object.keys(maping[jurusan]).map(key => [key])
                                    if (maping[jurusan][kelas] != undefined) {
                                        rl.question(color('Pelajaran: ', 'yellow'), (pelajaran) => {
                                            const listPelajaran = Object.keys(maping[jurusan][kelas]).map(key => [key])
                                            if (maping[jurusan][kelas][pelajaran] != undefined) {
                                                absen.login(username, pw, maping[jurusan][kelas][pelajaran])
                                                    .then(() => pertanyaan())
                                            } else {
                                                listCheck(listPelajaran)
                                                pertanyaan()
                                            }
                                        })
                                    } else {
                                        listCheck(listKelas)
                                        pertanyaan()
                                    }
                                })
                            } else {
                                listCheck(listJurusan)
                                pertanyaan()
                            }
                        })
                    })
                })
            } else {
                rl.question(color('Jurusan: ', 'yellow'), (jurusan) => {
                    if (maping[jurusan] != undefined) {
                        rl.question(color('Kelas: ', 'yellow'), (kelas) => {
                            const listKelas = Object.keys(maping[jurusan]).map(key => [key])
                            if (maping[jurusan][kelas] != undefined) {
                                rl.question(color('Pelajaran: ', 'yellow'), (pelajaran) => {
                                    const listPelajaran = Object.keys(maping[jurusan][kelas]).map(key => [key])
                                    if (maping[jurusan][kelas][pelajaran] != undefined) {
                                        absen.loginCookie(maping[jurusan][kelas][pelajaran])
                                            .then(() => pertanyaan())
                                    } else {
                                        listCheck(listPelajaran)
                                        pertanyaan()
                                    }
                                })
                            } else {
                                listCheck(listKelas)
                                pertanyaan()
                            }
                        })
                    } else {
                        listCheck(listJurusan)
                        pertanyaan()
                    }
                })
            }
        } else if (num == '2') {
            absen.logout()
                .then(() => pertanyaan())
        } else if (num == '0') {
            console.log(color('\nDa Da!!', 'yellow'))
            process.exit(0)
        } else {
            console.log(color('\nHanya pilih nomor yang terdapat di atas!', 'red'))
            pertanyaan()
        }
    })
}

pertanyaan()