﻿module BABYLON {
    /** @hidden */
    export interface INativeEngineInterop {
        requestAnimationFrame(callback: () => void): void;

        createIndexBuffer(indices: ArrayBuffer, is32Bits: boolean): WebGLBuffer;
        bindIndexBuffer(buffer: WebGLBuffer): void;
        
        createVertexBuffer(vertices: Float32Array): WebGLBuffer;
        bindVertexBuffer(buffer: WebGLBuffer, indx: number, size: number, type: number, normalized: boolean, stride: number, offset: number): void;

        createProgram(vertexShader: string, fragmentShader: string): WebGLProgram;
        getUniforms(shaderProgram: WebGLProgram, uniformsNames: string[]): WebGLUniformLocation[];
        getAttributes(shaderProgram: WebGLProgram, attributeNames: string[]): number[];
        setProgram(program: WebGLProgram): void;
        setState(culling: boolean, zOffset: number, reverseSide: boolean): void;

        setMatrix(uniform: WebGLUniformLocation, matrix: Float32Array): void;
        setIntArray(uniform: WebGLUniformLocation, array: Int32Array): void;
        setIntArray2(uniform: WebGLUniformLocation, array: Int32Array): void;
        setIntArray3(uniform: WebGLUniformLocation, array: Int32Array): void;
        setIntArray4(uniform: WebGLUniformLocation, array: Int32Array): void;
        setFloatArray(uniform: WebGLUniformLocation, array: Float32Array | number[]): void;
        setFloatArray2(uniform: WebGLUniformLocation, array: Float32Array | number[]): void;
        setFloatArray3(uniform: WebGLUniformLocation, array: Float32Array | number[]): void;
        setFloatArray4(uniform: WebGLUniformLocation, array: Float32Array | number[]): void;
        setMatrix3x3(uniform: WebGLUniformLocation, matrix: Float32Array): void;
        setMatrix2x2(uniform: WebGLUniformLocation, matrix: Float32Array): void;
        setFloat(uniform: WebGLUniformLocation, value: number): void;
        setFloat2(uniform: WebGLUniformLocation, x: number, y: number): void;
        setFloat3(uniform: WebGLUniformLocation, x: number, y: number, z: number): void;
        setBool(uniform: WebGLUniformLocation, bool: number): void;
        setFloat4(uniform: WebGLUniformLocation, x: number, y: number, z: number, w: number): void;

        createTexture(): WebGLTexture;
        loadTexture(texture: WebGLTexture, buffer: ArrayBuffer, mipMap: boolean): void;
        deleteTexture(texture: Nullable<WebGLTexture>): void;

        drawIndexed(fillMode: number, indexStart: number, indexCount: number): void;
        draw(fillMode: number, vertexStart: number, vertexCount: number): void;

        clear(r: number, g: number, b: number, a: number, backBuffer: boolean, depth: boolean, stencil: boolean): void;
    }

    class NativeSamplingMode {
        // Must match Filter enum in SpectreEngine.h.
        public static readonly POINT = 0;
        public static readonly MINPOINT_MAGPOINT_MIPPOINT = 1;
        public static readonly BILINEAR = 2;
        public static readonly MINLINEAR_MAGLINEAR_MIPPOINT = 3;
        public static readonly TRILINEAR = 4;
        public static readonly MINLINEAR_MAGLINEAR_MIPLINEAR = 5;
        public static readonly ANISOTROPIC = 6;
        public static readonly POINT_COMPARE = 7;
        public static readonly TRILINEAR_COMPARE = 8;
        public static readonly MINBILINEAR_MAGPOINT = 9;
        public static readonly MINLINEAR_MAGPOINT_MIPLINEAR = 10;
        public static readonly MINPOINT_MAGPOINT_MIPLINEAR = 11;
        public static readonly MINPOINT_MAGLINEAR_MIPPOINT = 12;
        public static readonly MINPOINT_MAGLINEAR_MIPLINEAR = 13;
        public static readonly MINLINEAR_MAGPOINT_MIPPOINT = 14;
    }

    /** @hidden */
    declare var nativeEngineInterop: INativeEngineInterop;

    /** @hidden */
    export class NativeEngineWrapperOptions {
        public renderWidth = 1024;
        public renderHeight = 768;

        public textureSize = 512;

        public deterministicLockstep = false;
        public lockstepMaxSteps = 4;
    }

    /** @hidden */
    export class NativeEngineWrapper extends Engine {
        private _options: NativeEngineWrapperOptions;

        public isDeterministicLockStep(): boolean {
            return this._options.deterministicLockstep;
        }

        public getLockstepMaxSteps(): number {
            return this._options.lockstepMaxSteps;
        }

        public getHardwareScalingLevel(): number {
            return 1.0;
        }

        // INativeEngineInterop
        // 
        public constructor(private readonly _interop: INativeEngineInterop = nativeEngineInterop, options: NativeEngineWrapperOptions = new NativeEngineWrapperOptions()) {
            super(null);

            if (options.deterministicLockstep === undefined) {
                options.deterministicLockstep = false;
            }

            if (options.lockstepMaxSteps === undefined) {
                options.lockstepMaxSteps = 4;
            }

            this._options = options;

            // TODO: Initialize this more correctly based on the hardware capabilities reported by Spectre.
            // Init caps
            // We consider we are on a webgl1 capable device

            this._caps = new EngineCapabilities();
            this._caps.maxTexturesImageUnits = 16;
            this._caps.maxVertexTextureImageUnits = 16;
            this._caps.maxTextureSize = 512;
            this._caps.maxCubemapTextureSize = 512;
            this._caps.maxRenderTextureSize = 512;
            this._caps.maxVertexAttribs = 16;
            this._caps.maxVaryingVectors = 16;
            this._caps.maxFragmentUniformVectors = 16;
            this._caps.maxVertexUniformVectors = 16;

            // Extensions
            this._caps.standardDerivatives = false;

            this._caps.astc = null;
            this._caps.s3tc = null;
            this._caps.pvrtc = null;
            this._caps.etc1 = null;
            this._caps.etc2 = null;

            this._caps.textureAnisotropicFilterExtension = null;
            this._caps.maxAnisotropy = 0;
            this._caps.uintIndices = false;
            this._caps.fragmentDepthSupported = false;
            this._caps.highPrecisionShaderSupported = true;

            this._caps.colorBufferFloat = false;
            this._caps.textureFloat = false;
            this._caps.textureFloatLinearFiltering = false;
            this._caps.textureFloatRender = false;

            this._caps.textureHalfFloat = false;
            this._caps.textureHalfFloatLinearFiltering = false;
            this._caps.textureHalfFloatRender = false;

            this._caps.textureLOD = false;
            this._caps.drawBuffersExtension = false;

            this._caps.depthTextureExtension = false;
            this._caps.vertexArrayObject = false;
            this._caps.instancedArrays = false;

            Tools.Log("Babylon.js null engine (v" + Engine.Version + ") launched");

            // Wrappers
            if (typeof URL === "undefined") {
                (<any>URL) = {
                    createObjectURL: function () { },
                    revokeObjectURL: function () { }
                }
            }

            if (typeof Blob === "undefined") {
                (<any>Blob) = function () { };
            }
        }

        /** 
         * Can be used to override the current requestAnimationFrame requester.
         * @hidden 
         */
        protected _queueNewFrame(bindedRenderFunction: any, requester: any): number {
            this._interop.requestAnimationFrame(bindedRenderFunction);
            return 0;
        }

        public clear(color: Color4, backBuffer: boolean, depth: boolean, stencil: boolean = false): void {
            this._interop.clear(color.r, color.g, color.b, color.a, backBuffer, depth, stencil);
        }

        public createIndexBuffer(indices: IndicesArray): WebGLBuffer {
            var arrayBuffer: ArrayBuffer;
            var is32Bits;
            if (indices instanceof Uint16Array) {
                arrayBuffer = indices.buffer;
                is32Bits = false;
            } else if (indices instanceof Uint32Array) {
                arrayBuffer = indices.buffer;
                is32Bits = true;
            } else {
                arrayBuffer = new Uint32Array(indices).buffer;
                is32Bits = true;
            }

            const buffer = this._interop.createIndexBuffer(arrayBuffer, is32Bits);
            buffer.capacity = indices.length;
            buffer.references = 1;
            buffer.is32Bits = is32Bits;

            return buffer;
        }

        public createVertexBuffer(data: DataArray): WebGLBuffer {
            var floatArray: Float32Array;
            if (data instanceof Array ||
                data instanceof ArrayBuffer) {
                floatArray = new Float32Array(data);
            } else {
                floatArray = new Float32Array((<ArrayBufferView>data).buffer);
            }

            const buffer = this._interop.createVertexBuffer(floatArray);
            buffer.capacity = floatArray.length;
            buffer.references = 1;
            buffer.is32Bits = true;

            return buffer;
        }

        // BUFFERS.
        public bindBuffers(vertexBuffers: { [key: string]: VertexBuffer; }, indexBuffer: WebGLBuffer, effect: Effect): void {
            // Index
            if (indexBuffer) {
                this._interop.bindIndexBuffer(indexBuffer);
            }

            // Vertex
            var attributes = effect.getAttributesNames();
            for (var index = 0; index < attributes.length; index++) {
                var order = effect.getAttributeLocation(index);
                if (order >= 0) {
                    var vertexBuffer = vertexBuffers[attributes[index]];
                    if (!vertexBuffer) {
                        continue;
                    }

                    var buffer = vertexBuffer.getBuffer();
                    if (buffer) {
                        this._interop.bindVertexBuffer(buffer, order, vertexBuffer.getSize(), vertexBuffer.type, vertexBuffer.normalized, vertexBuffer.byteStride, vertexBuffer.byteOffset);
                    }
                }
            }
        }
        
        public getAttributes(shaderProgram: WebGLProgram, attributesNames: string[]): number[] {
            return this._interop.getAttributes(shaderProgram, attributesNames);
        }

        /**
         * Draw a list of indexed primitives
         * @param fillMode defines the primitive to use
         * @param indexStart defines the starting index
         * @param indexCount defines the number of index to draw
         * @param instancesCount defines the number of instances to draw (if instanciation is enabled)
         */
        public drawElementsType(fillMode: number, indexStart: number, indexCount: number, instancesCount?: number): void {
            // Apply states
            // this.applyStates();

            this._drawCalls.addCount(1, false);

            // TODO: Make this implementation more robust like core Engine version.

            // Render
            //var indexFormat = this._uintIndicesCurrentlySet ? this._gl.UNSIGNED_INT : this._gl.UNSIGNED_SHORT;
            
            //var mult = this._uintIndicesCurrentlySet ? 4 : 2;
            // if (instancesCount) {
            //     this._gl.drawElementsInstanced(drawMode, indexCount, indexFormat, indexStart * mult, instancesCount);
            // } else {
            this._interop.drawIndexed(fillMode, indexStart, indexCount);
            // }
        }

        /**
         * Draw a list of unindexed primitives
         * @param fillMode defines the primitive to use
         * @param verticesStart defines the index of first vertex to draw 
         * @param verticesCount defines the count of vertices to draw
         * @param instancesCount defines the number of instances to draw (if instanciation is enabled)
         */
        public drawArraysType(fillMode: number, verticesStart: number, verticesCount: number, instancesCount?: number): void {
            // Apply states
            // this.applyStates();
            this._drawCalls.addCount(1, false);

            // TODO: Make this implementation more robust like core Engine version.

            // if (instancesCount) {
            //     this._gl.drawArraysInstanced(drawMode, verticesStart, verticesCount, instancesCount);
            // } else {
            this._interop.draw(fillMode, verticesStart, verticesCount);
            // }
        }

        /**
         * Directly creates a webGL program
         * @param vertexCode defines the vertex shader code to use
         * @param fragmentCode defines the fragment shader code to use
         * @param context defines the webGL context to use (if not set, the current one will be used)
         * @param transformFeedbackVaryings defines the list of transform feedback varyings to use
         * @returns the new webGL program
         */
        public createRawShaderProgram(vertexCode: string, fragmentCode: string, context?: WebGLRenderingContext, transformFeedbackVaryings: Nullable<string[]> = null): WebGLProgram {
            return this._interop.createProgram(vertexCode, fragmentCode);
        }

        /**
         * Creates a webGL program
         * @param vertexCode  defines the vertex shader code to use
         * @param fragmentCode defines the fragment shader code to use
         * @param defines defines the string containing the defines to use to compile the shaders
         * @param context defines the webGL context to use (if not set, the current one will be used)
         * @param transformFeedbackVaryings defines the list of transform feedback varyings to use
         * @returns the new webGL program
         */
        public createShaderProgram(vertexCode: string, fragmentCode: string, defines: Nullable<string>, context?: WebGLRenderingContext, transformFeedbackVaryings: Nullable<string[]> = null): WebGLProgram {
            this.onBeforeShaderCompilationObservable.notifyObservers(this);

            var shaderVersion = (this._webGLVersion > 1) ? "#version 300 es\n#define WEBGL2 \n" : "";
            var vertexCodeConcat = Engine._concatenateShader(vertexCode, defines, shaderVersion);
            var fragmentCodeConcat = Engine._concatenateShader(fragmentCode, defines, shaderVersion);

            var program = this.createRawShaderProgram(vertexCodeConcat, fragmentCodeConcat);
            program.transformFeedback = null;
            program.__SPECTOR_rebuildProgram = null;

            this.onAfterShaderCompilationObservable.notifyObservers(this);

            return program;
        }

        /**
         * Binds an effect to the webGL context
         * @param effect defines the effect to bind
         */
        public bindSamplers(effect: Effect): void {
            var program = effect.getProgram();
            if (this._currentProgram !== program) {
                this._interop.setProgram(effect.getProgram());
                this._currentProgram = program;
            }

            // var samplers = effect.getSamplers();
            // for (var index = 0; index < samplers.length; index++) {
            //     var uniform = effect.getUniform(samplers[index]);

            //     if (uniform) {
            //         this._boundUniforms[index] = uniform;
            //     }
            // }

            this._currentEffect = null;
        }

        public getUniforms(shaderProgram: WebGLProgram, uniformsNames: string[]): WebGLUniformLocation[] {
            return this._interop.getUniforms(shaderProgram, uniformsNames);
        }

        public setMatrix(uniform: WebGLUniformLocation, matrix: Matrix): void {
            if (!uniform)
                return;

            this._interop.setMatrix(uniform, matrix.toArray());
        }

        public getRenderWidth(useScreen = false): number {
            if (!useScreen && this._currentRenderTarget) {
                return this._currentRenderTarget.width;
            }

            return this._options.renderWidth;
        }

        public getRenderHeight(useScreen = false): number {
            if (!useScreen && this._currentRenderTarget) {
                return this._currentRenderTarget.height;
            }

            return this._options.renderHeight;
        }

        public setViewport(viewport: Viewport, requiredWidth?: number, requiredHeight?: number): void {
            this._cachedViewport = viewport;
        }

        public setState(culling: boolean, zOffset: number = 0, force?: boolean, reverseSide = false): void {
            this._interop.setState(culling, zOffset, reverseSide);
        }

        public setIntArray(uniform: WebGLUniformLocation, array: Int32Array): void {
            if (!uniform)
                return;

            this._interop.setIntArray(uniform, array);
        }

        public setIntArray2(uniform: WebGLUniformLocation, array: Int32Array): void {
            if (!uniform)
                return;

            this._interop.setIntArray2(uniform, array);
        }

        public setIntArray3(uniform: WebGLUniformLocation, array: Int32Array): void {
            if (!uniform)
                return;

            this._interop.setIntArray3(uniform, array);
        }

        public setIntArray4(uniform: WebGLUniformLocation, array: Int32Array): void {
            if (!uniform)
                return;

            this._interop.setIntArray4(uniform, array);
        }

        public setFloatArray(uniform: WebGLUniformLocation, array: Float32Array): void {
            if (!uniform)
                return;

            this._interop.setFloatArray(uniform, array);
        }

        public setFloatArray2(uniform: WebGLUniformLocation, array: Float32Array): void {
            if (!uniform)
                return;

            this._interop.setFloatArray2(uniform, array);
        }

        public setFloatArray3(uniform: WebGLUniformLocation, array: Float32Array): void {
            if (!uniform)
                return;

            this._interop.setFloatArray3(uniform, array);
        }

        public setFloatArray4(uniform: WebGLUniformLocation, array: Float32Array): void {
            if (!uniform)
                return;

            this._interop.setFloatArray4(uniform, array);
        }

        public setArray(uniform: WebGLUniformLocation, array: number[]): void {
            if (!uniform)
                return;

            this._interop.setFloatArray(uniform, array);
        }

        public setArray2(uniform: WebGLUniformLocation, array: number[]): void {
            if (!uniform)
                return;

            this._interop.setFloatArray2(uniform, array);
        }

        public setArray3(uniform: WebGLUniformLocation, array: number[]): void {
            if (!uniform)
                return;

            this._interop.setFloatArray3(uniform, array);
        }

        public setArray4(uniform: WebGLUniformLocation, array: number[]): void {
            if (!uniform)
                return;

            this._interop.setFloatArray4(uniform, array);
        }

        public setMatrices(uniform: WebGLUniformLocation, matrices: Float32Array): void {
            if (!uniform)
                return;

            this._interop.setMatrix(uniform, matrices);
        }

        public setMatrix3x3(uniform: WebGLUniformLocation, matrix: Float32Array): void {
            if (!uniform)
                return;

            this._interop.setMatrix3x3(uniform, matrix);
        }

        public setMatrix2x2(uniform: WebGLUniformLocation, matrix: Float32Array): void {
            if (!uniform)
                return;

            this._interop.setMatrix2x2(uniform, matrix);
        }

        public setFloat(uniform: WebGLUniformLocation, value: number): void {
            if (!uniform)
                return;

            this._interop.setFloat(uniform, value);
        }

        public setFloat2(uniform: WebGLUniformLocation, x: number, y: number): void {
            if (!uniform)
                return;

            this._interop.setFloat2(uniform, x, y);
        }

        public setFloat3(uniform: WebGLUniformLocation, x: number, y: number, z: number): void {
            if (!uniform)
                return;

            this._interop.setFloat3(uniform, x, y, z);
        }

        public setBool(uniform: WebGLUniformLocation, bool: number): void {
            if (!uniform)
                return;

            this._interop.setBool(uniform, bool);
        }

        public setFloat4(uniform: WebGLUniformLocation, x: number, y: number, z: number, w: number): void {
            if (!uniform)
                return;

            this._interop.setFloat4(uniform, x, y, z, w);
        }

        public setColor3(uniform: WebGLUniformLocation, color3: Color3): void {
            if (!uniform)
                return;

            this._interop.setFloat3(uniform, color3.r, color3.g, color3.b);
        }

        public setColor4(uniform: WebGLUniformLocation, color3: Color3, alpha: number): void {
            if (!uniform)
                return;

            this._interop.setFloat4(uniform, color3.r, color3.g, color3.b, alpha);
        }

        public setAlphaMode(mode: number, noDepthWriteChange: boolean = false): void {
            if (this._alphaMode === mode) {
                return;
            }

            this._alphaState.alphaBlend = (mode !== Engine.ALPHA_DISABLE);

            if (!noDepthWriteChange) {
                this.setDepthWrite(mode === Engine.ALPHA_DISABLE);
            }
            this._alphaMode = mode;
        }

        public wipeCaches(bruteForce?: boolean): void {
            if (this.preventCacheWipeBetweenFrames) {
                return;
            }
            this.resetTextureCache();
            this._currentEffect = null;

            if (bruteForce) {
                this._currentProgram = null;

                this._stencilState.reset();
                this._depthCullingState.reset();
                this._alphaState.reset();
            }

            this._cachedVertexBuffers = null;
            this._cachedIndexBuffer = null;
            this._cachedEffectForVertexBuffers = null;
        }

        public _createTexture(): WebGLTexture {
            return this._interop.createTexture();
        }

        protected _deleteTexture(texture: Nullable<WebGLTexture>): void {
            this._interop.deleteTexture(texture);
        }

        // TODO: Refactor to share more logic with babylon.engine.ts version.
        /**
         * Usually called from BABYLON.Texture.ts.
         * Passed information to create a WebGLTexture
         * @param urlArg defines a value which contains one of the following:
         * * A conventional http URL, e.g. 'http://...' or 'file://...'
         * * A base64 string of in-line texture data, e.g. 'data:image/jpg;base64,/...'
         * * An indicator that data being passed using the buffer parameter, e.g. 'data:mytexture.jpg'
         * @param noMipmap defines a boolean indicating that no mipmaps shall be generated.  Ignored for compressed textures.  They must be in the file
         * @param invertY when true, image is flipped when loaded.  You probably want true. Ignored for compressed textures.  Must be flipped in the file
         * @param scene needed for loading to the correct scene
         * @param samplingMode mode with should be used sample / access the texture (Default: BABYLON.Texture.TRILINEAR_SAMPLINGMODE)
         * @param onLoad optional callback to be called upon successful completion
         * @param onError optional callback to be called upon failure
         * @param buffer a source of a file previously fetched as either a base64 string, an ArrayBuffer (compressed or image format), or a Blob
         * @param fallback an internal argument in case the function must be called again, due to etc1 not having alpha capabilities
         * @param format internal format.  Default: RGB when extension is '.jpg' else RGBA.  Ignored for compressed textures
         * @param forcedExtension defines the extension to use to pick the right loader
         * @returns a InternalTexture for assignment back into BABYLON.Texture
         */
        public createTexture(urlArg: Nullable<string>, noMipmap: boolean, invertY: boolean, scene: Nullable<Scene>, samplingMode: number = Engine.TEXTURE_TRILINEAR_SAMPLINGMODE,
            onLoad: Nullable<() => void> = null, onError: Nullable<(message: string, exception: any) => void> = null,
            buffer: Nullable<string | ArrayBuffer | Blob> = null, fallback: Nullable<InternalTexture> = null, format: Nullable<number> = null,
            forcedExtension: Nullable<string> = null): InternalTexture {
            var url = String(urlArg); // assign a new string, so that the original is still available in case of fallback
            var fromData = url.substr(0, 5) === "data:";
            var fromBlob = url.substr(0, 5) === "blob:";
            var isBase64 = fromData && url.indexOf("base64") !== -1;

            let texture = fallback ? fallback : new InternalTexture(this, InternalTexture.DATASOURCE_URL);

            // establish the file extension, if possible
            var lastDot = url.lastIndexOf('.');
            var extension = forcedExtension ? forcedExtension : (lastDot > -1 ? url.substring(lastDot).toLowerCase() : "");

            // TODO: Add support for compressed texture formats.
            var textureFormatInUse: Nullable<string> = null;

            let loader: Nullable<IInternalTextureLoader> = null;
            for (let availableLoader of Engine._TextureLoaders) {
                if (availableLoader.canLoad(extension, textureFormatInUse, fallback, isBase64, buffer ? true : false)) {
                    loader = availableLoader;
                    break;
                }
            }

            if (loader) {
                url = loader.transformUrl(url, textureFormatInUse);
            }

            if (scene) {
                scene._addPendingData(texture);
            }
            texture.url = url;
            texture.generateMipMaps = !noMipmap;
            texture.samplingMode = samplingMode;
            texture.invertY = invertY;

            if (!this.doNotHandleContextLost) {
                // Keep a link to the buffer only if we plan to handle context lost
                texture._buffer = buffer;
            }

            let onLoadObserver: Nullable<Observer<InternalTexture>> = null;
            if (onLoad && !fallback) {
                onLoadObserver = texture.onLoadedObservable.add(onLoad);
            }

            if (!fallback) this._internalTexturesCache.push(texture);

            let onInternalError = (message?: string, exception?: any) => {
                if (scene) {
                    scene._removePendingData(texture);
                }

                let customFallback = false;
                if (loader) {
                    const fallbackUrl = loader.getFallbackTextureUrl(url, textureFormatInUse);
                    if (fallbackUrl) {
                        // Add Back
                        customFallback = true;
                        this.createTexture(urlArg, noMipmap, invertY, scene, samplingMode, null, onError, buffer, texture);
                    }
                }

                if (!customFallback) {
                    if (onLoadObserver) {
                        texture.onLoadedObservable.remove(onLoadObserver);
                    }
                    if (Tools.UseFallbackTexture) {
                        this.createTexture(Tools.fallbackTexture, noMipmap, invertY, scene, samplingMode, null, onError, buffer, texture);
                    }
                }

                if (onError) {
                    onError(message || "Unknown error", exception);
                }
            }

            // processing for non-image formats
            if (loader) {
                throw new Error("Loading textures from loader not yet implemented.");
                // var callback = (data: string | ArrayBuffer) => {
                //     loader!.loadData(data as ArrayBuffer, texture, (width: number, height: number, loadMipmap: boolean, isCompressed: boolean, done: () => void) => {
                //         this._prepareWebGLTexture(texture, scene, width, height, invertY, !loadMipmap, isCompressed, () => {
                //                 done();
                //                 return false;
                //             }, 
                //             samplingMode);
                //     });
                // }

                // if (!buffer) {
                //     this._loadFile(url, callback, undefined, scene ? scene.database : undefined, true, (request?: XMLHttpRequest, exception?: any) => {
                //         onInternalError("Unable to load " + (request ? request.responseURL : url, exception));
                //     });
                // } else {
                //     callback(buffer as ArrayBuffer);
                // }
            } else {
                var onload = (data: string | ArrayBuffer, responseURL?: string) => {
                    let arrayBuffer = data as ArrayBuffer;

                    if (fromBlob && !this.doNotHandleContextLost) {
                        // We need to store the image if we need to rebuild the texture
                        // in case of a webgl context lost
                        texture._buffer = data;
                    }

                    if (!texture._webGLTexture) {
                        //  this.resetTextureCache();
                        if (scene) {
                            scene._removePendingData(texture);
                        }

                        return;
                    }

                    this._interop.loadTexture(texture._webGLTexture, arrayBuffer, !noMipmap);

                    this._unpackFlipY(invertY === undefined ? true : (invertY ? true : false));

                    texture.baseWidth = width;
                    texture.baseHeight = height;
                    texture.width = width;
                    texture.height = height;
                    texture.isReady = true;
        
                    var filters = this._getSamplingParameters(samplingMode, !noMipmap);

                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filters.mag);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filters.min);

                    // this.resetTextureCache();
                    if (scene) {
                        scene._removePendingData(texture);
                    }
        
                    texture.onLoadedObservable.notifyObservers(texture);
                    texture.onLoadedObservable.clear();
                };

                if (!fromData || isBase64) {
                    let onLoadFileError = (request?: XMLHttpRequest, exception?: any) => {
                        onInternalError("Failed to retrieve " + url + ".", exception);
                    }
                    Tools.LoadFile(url, onload, undefined, undefined, /*useArrayBuffer*/true, onLoadFileError);
                } else if (buffer instanceof ArrayBuffer) {
                    onload(buffer);
                } else if (typeof buffer === "string" || buffer instanceof Blob) {
                    throw new Error("Loading texture from string/Blob not yet implemented.");
                    //Tools.LoadImage(buffer, onload, onInternalError, null);
                } else {
                    throw new Error("Unexpected texture source type.");
                }
            }

            return texture;
        }

        private _get(samplingMode: number, generateMipMaps: boolean): { min: number; mag: number } {
        }

        public createRenderTargetTexture(size: any, options: boolean | RenderTargetCreationOptions): InternalTexture {
            let fullOptions = new RenderTargetCreationOptions();

            if (options !== undefined && typeof options === "object") {
                fullOptions.generateMipMaps = options.generateMipMaps;
                fullOptions.generateDepthBuffer = options.generateDepthBuffer === undefined ? true : options.generateDepthBuffer;
                fullOptions.generateStencilBuffer = fullOptions.generateDepthBuffer && options.generateStencilBuffer;
                fullOptions.type = options.type === undefined ? Engine.TEXTURETYPE_UNSIGNED_INT : options.type;
                fullOptions.samplingMode = options.samplingMode === undefined ? Texture.TRILINEAR_SAMPLINGMODE : options.samplingMode;
            } else {
                fullOptions.generateMipMaps = <boolean>options;
                fullOptions.generateDepthBuffer = true;
                fullOptions.generateStencilBuffer = false;
                fullOptions.type = Engine.TEXTURETYPE_UNSIGNED_INT;
                fullOptions.samplingMode = Texture.TRILINEAR_SAMPLINGMODE;
            }
            var texture = new InternalTexture(this, InternalTexture.DATASOURCE_RENDERTARGET);

            var width = size.width || size;
            var height = size.height || size;

            texture._depthStencilBuffer = {};
            texture._framebuffer = {};
            texture.baseWidth = width;
            texture.baseHeight = height;
            texture.width = width;
            texture.height = height;
            texture.isReady = true;
            texture.samples = 1;
            texture.generateMipMaps = fullOptions.generateMipMaps ? true : false;
            texture.samplingMode = fullOptions.samplingMode;
            texture.type = fullOptions.type;
            texture._generateDepthBuffer = fullOptions.generateDepthBuffer;
            texture._generateStencilBuffer = fullOptions.generateStencilBuffer ? true : false;

            this._internalTexturesCache.push(texture);

            return texture;
        }

        public updateTextureSamplingMode(samplingMode: number, texture: InternalTexture): void {
            texture.samplingMode = samplingMode;
        }

        public bindFramebuffer(texture: InternalTexture, faceIndex?: number, requiredWidth?: number, requiredHeight?: number, forceFullscreenViewport?: boolean): void {
            if (this._currentRenderTarget) {
                this.unBindFramebuffer(this._currentRenderTarget);
            }
            this._currentRenderTarget = texture;
            this._currentFramebuffer = texture._MSAAFramebuffer ? texture._MSAAFramebuffer : texture._framebuffer;
            if (this._cachedViewport && !forceFullscreenViewport) {
                this.setViewport(this._cachedViewport, requiredWidth, requiredHeight);
            }
        }

        public unBindFramebuffer(texture: InternalTexture, disableGenerateMipMaps = false, onBeforeUnbind?: () => void): void {
            this._currentRenderTarget = null;

            if (onBeforeUnbind) {
                if (texture._MSAAFramebuffer) {
                    this._currentFramebuffer = texture._framebuffer;
                }
                onBeforeUnbind();
            }
            this._currentFramebuffer = null;
        }

        public createDynamicVertexBuffer(vertices: FloatArray): WebGLBuffer {
            var vbo = {
                capacity: 1,
                references: 1,
                is32Bits: false
            }

            return vbo;
        }

        public updateDynamicIndexBuffer(indexBuffer: WebGLBuffer, indices: IndicesArray, offset: number = 0): void {
            throw new Error("updateDynamicIndexBuffer not yet implemented.")
        }

        /**
         * Updates a dynamic vertex buffer.
         * @param vertexBuffer the vertex buffer to update
         * @param data the data used to update the vertex buffer
         * @param byteOffset the byte offset of the data (optional)
         * @param byteLength the byte length of the data (optional)
         */
        public updateDynamicVertexBuffer(vertexBuffer: WebGLBuffer, vertices: FloatArray, byteOffset?: number, byteLength?: number): void {
            throw new Error("updateDynamicVertexBuffer not yet implemented.")
        }

        protected _bindTextureDirectly(target: number, texture: Nullable<InternalTexture>, forTextureDataUpdate = false, force = false): boolean {
            if (this._boundTexturesCache[this._activeChannel] !== texture) {
                this._boundTexturesCache[this._activeChannel] = texture;
                return false;
            } else {
                return true;
            }
        }

        public _releaseBuffer(buffer: WebGLBuffer): boolean {
            buffer.references--;

            if (buffer.references === 0) {
                // TODO: Proactively delete the underlying buffer here in Spectre.
                return true;
            }

            return false;
        }

        public releaseEffects() {
        }

        /** @hidden */
        public _uploadCompressedDataToTextureDirectly(texture: InternalTexture, internalFormat: number, width: number, height: number, data: ArrayBufferView, faceIndex: number = 0, lod: number = 0) {
            throw new Error("_uploadCompressedDataToTextureDirectly not implemented.");
        }

        /** @hidden */
        public _uploadDataToTextureDirectly(texture: InternalTexture, imageData: ArrayBufferView, faceIndex: number = 0, lod: number = 0): void {
            throw new Error("_uploadDataToTextureDirectly not implemented.");
        }

        /** @hidden */
        public _uploadArrayBufferViewToTexture(texture: InternalTexture, imageData: ArrayBufferView, faceIndex: number = 0, lod: number = 0): void {
            throw new Error("_uploadArrayBufferViewToTexture not implemented.");
        }

        /** @hidden */
        public _uploadImageToTexture(texture: InternalTexture, image: HTMLImageElement, faceIndex: number = 0, lod: number = 0) {
            throw new Error("_uploadArrayBufferViewToTexture not implemented.");
        }
    }
}