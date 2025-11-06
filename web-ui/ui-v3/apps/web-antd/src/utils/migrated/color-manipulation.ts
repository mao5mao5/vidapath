/*
* Copyright (c) 2009-2022. Authors: see NOTICE file.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint no-undef: 0 */

/* Sources:
 * https://www.dfstudios.co.uk/articles/programming/image-programming-algorithms/
 * https://stackoverflow.com/a/8510751
 * http://alienryderflex.com/saturation.html
 */

// 定义全局变量的类型
interface ColorManipulationConfig {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  contrastFactor: number;
  hueMatrix: number[][];
}

// 创建配置对象，替代全局变量
const config: ColorManipulationConfig = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  contrastFactor: -1,
  hueMatrix: [[-1]]
};

const Pr = 0.299;
const Pg = 0.587;
const Pb = 0.114;

function computeContrastFactor(contrast: number): number {
  return 259 * (contrast + 255) / 255 / (259 - contrast);
}

function computeHueMatrix(hue: number): number[][] {
  let angle = hue * Math.PI / 180;
  let cosA = Math.cos(angle);
  let sinA = Math.sin(angle);
  let sqrtThird = Math.sqrt(1 / 3);
  let hueMatrix = [
    [
      cosA + (1 - cosA) / 3,
      1 / 3 * (1 - cosA) - sqrtThird * sinA,
      1 / 3 * (1 - cosA) + sqrtThird * sinA
    ],
    [
      1 / 3 * (1 - cosA) + sqrtThird * sinA,
      cosA + 1 / 3 * (1 - cosA),
      1 / 3 * (1 - cosA) - sqrtThird * sinA
    ],
    [
      1 / 3 * (1 - cosA) - sqrtThird * sinA,
      1 / 3 * (1 - cosA) + sqrtThird * sinA,
      cosA + 1 / 3 * (1 - cosA)
    ]
  ];
  return hueMatrix;
}

function truncatePixelValue(val: number): number {
  return val < 0 ? 0 : val > 255 ? 255 : val;
}

function changeBrightnessContrast(pixel: number[]): void {
  for (let i = 0; i < 3; i++) {
    let newVal = truncatePixelValue(config.contrastFactor * (pixel[i] - 128) + 128) + config.brightness;
    pixel[i] = truncatePixelValue(newVal);
  }
}

function changeSaturation(pixel: number[]): void {
  let r = pixel[0];
  let g = pixel[1];
  let b = pixel[2];

  let saturationConstant = Math.sqrt(r * r * Pr + g * g * Pg + b * b * Pb);

  for (let i = 0; i < 3; i++) {
    let newVal = saturationConstant + (pixel[i] - saturationConstant) * (1 + config.saturation / 100);
    pixel[i] = truncatePixelValue(newVal);
  }
}

function changeHue(pixel: number[]): void {
  let r = pixel[0];
  let g = pixel[1];
  let b = pixel[2];

  for (let i = 0; i < 3; i++) {
    let newVal = config.hueMatrix[i][0] * r + config.hueMatrix[i][1] * g + config.hueMatrix[i][2] * b;
    pixel[i] = truncatePixelValue(newVal);
  }
}

export const constLib = {
  Pr,
  Pg,
  Pb,

  truncatePixelValue,
  changeBrightnessContrast,
  changeSaturation,
  changeHue,

  computeContrastFactor,
  computeHueMatrix,
};

export interface ColorOperationParams {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
}

export function operation(pixels: number[][], params: ColorOperationParams = {}): number[] {
  // 更新配置参数
  config.brightness = params.brightness || 0;
  config.contrast = params.contrast || 0;
  config.saturation = params.saturation || 0;
  config.hue = params.hue || 0;
  
  let pixel = [...pixels[0]]; // 创建副本避免修改原数组

  if (config.brightness !== 0 || config.contrast !== 0) {
    if (config.contrastFactor === -1) {
      config.contrastFactor = computeContrastFactor(config.contrast);
    }
    changeBrightnessContrast(pixel);
  }

  if (config.saturation !== 0) {
    changeSaturation(pixel);
  }

  if (config.hue !== 0) {
    if (config.hueMatrix[0][0] === -1) {
      config.hueMatrix = computeHueMatrix(config.hue);
    }
    changeHue(pixel);
  }

  return pixel;
}