
class Vector2{
    constructor(_x,_y){
        this.x = _x;
        this.y = _y;
    }
}

/**
 * @member {Vector2[]} vertices - Array of points
 */
class Mesh{
    constructor(){
        this.vertices = [];
    }
    get vertexCount(){
        return this.vertices.length;
    }
}

/**
 * @public
 * 
 * @member {int[]} spring1
 * @member {int[]} spring2
 * 
 * @member {float[]} length
 * 
 * @member {float[]} nx
 * @member {float[]} ny
 */

class Springs{

    /** 
     * @param {int} n_springs 
     */
    constructor(n_springs){
        this.spring1 = new Int32Array(n_springs);
        this.spring2 = new Int32Array(n_springs);
        this.length = new Float64Array(n_springs); 
        this.nx = new Float64Array(n_springs);   
        this.ny = new Float64Array(n_springs);     
    }
}

/**
 * @public
 * 
 * @member {Float64Array} x
 * @member {Float64Array} y
 * 
 * @member {Float64Array} vx
 * @member {Float64Array} vy
 * 
 * @member {Float64Array} fx
 * @member {Float64Array} fy
 */

class Points{
    /**
     * @param {int} n_pts 
     */
    constructor(n_pts)
    {
        this.x = new Float64Array(n_pts);
        this.y = new Float64Array(n_pts);
        this.vx = new Float64Array(n_pts);
        this.vy = new Float64Array(n_pts);
        this.fx = new Float64Array(n_pts);
        this.fy = new Float64Array(n_pts);
    }
}





class JellyObject{
    constructor(_position,_size,_mesh){


        /**
         * Constants
         */
        this.MAX_SPEED = 80;
        this.KS = 14000;
        this.KD = 1;
        this.FAPP = 10;
        this.NDF = 0.02;
        this.pressure = 300000;


        this.Mass = 12;
        this.position = _position;
        this.size = _size;
        this.mesh = _mesh;
        this.numPoints = this.mesh.vertexCount;
        this.points = new Points(this.numPoints);
        for(let i = 0; i < this.numPoints; ++i){
            this.points.x[i] = this.mesh.vertices[i].x;
            this.points.y[i] = this.mesh.vertices[i].y;
        }
        this.springs = new Springs(this.numPoints);   
        for(let i = 0; i < this.numPoints-1; ++i){
            this.addSpring(i,i,i+1);
        }
        this.addSpring(this.numPoints-1,this.numPoints-1,0)
    }
}