

Mesh.prototype.draw = function(position,size,color){
    if(!color) color = [0,0,0];
    stroke(...color);
    fill(...color);
    beginShape();
    for(let i of this.vertices) vertex(position.x + i.x * size.x, position.y + i.y * size.y);
    endShape(CLOSE);
}



JellyObject.prototype.addSpring = function(i,j,k)
{
    this.springs.spring1[i] = j;
    this.springs.spring2[i] = k;

    this.springs.length[i] = Math.sqrt((this.points.x[j] - this.points.x[k]) * (this.points.x[j] - this.points.x[k])
    + (this.points.y[j] - this.points.y[k]) * (this.points.y[j] - this.points.y[k]));
}

JellyObject.prototype.updateMesh = function(){
    for(let i = 0; i < this.mesh.vertices.length; ++i){
        this.mesh.vertices[i].x = this.points.x[i];
        this.mesh.vertices[i].y = this.points.y[i];
    }
}




JellyObject.prototype.accumulateForces = function(){

    let x1, x2, y1, y2;
    let r12d;
    let vx12;
    let vy12;
    let f;
    let fx0, fy0;
    let volume = 0;
    let pressurev;

    for (let i = 0; i < this.numPoints; i++)
    {
        if(!accY)
            this.points.fy[i] = 9.81*10*this.Mass;
        else{
            this.points.fy[i] = accY*10*this.Mass;
        }

        if(!accX)
            this.points.fx[i] = 0;
        else{
            this.points.fx[i] = accX*10*this.Mass;
        }
    }



    for (let i = 0; i < this.numPoints; i++)
    {
        x1 = this.points.x[this.springs.spring1[i]];
        x2 = this.points.x[this.springs.spring2[i]];
        y1 = this.points.y[this.springs.spring1[i]];
        y2 = this.points.y[this.springs.spring2[i]];

        //Find the distance between each spring:
        r12d = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

        //Accumulate spring forces:
        if (r12d >= 0.001)
        {
            vx12 = this.points.vx[this.springs.spring1[i]] - this.points.vx[this.springs.spring2[i]];
            vy12 = this.points.vy[this.springs.spring1[i]] - this.points.vy[this.springs.spring2[i]];

            f = (r12d - this.springs.length[i]) * this.KS + (vx12 * (x1 - x2) + vy12 * (y1 - y2)) * this.KD / r12d;

            fx0 = ((x1 - x2) / r12d) * f;
            fy0 = ((y1 - y2) / r12d) * f;

            this.points.fx[this.springs.spring1[i]] -= fx0;
            this.points.fy[this.springs.spring1[i]] -= fy0;

            this.points.fx[this.springs.spring2[i]] += fx0;
            this.points.fy[this.springs.spring2[i]] += fy0;
        }
        this.springs.nx[i] = -(y1 - y2) / r12d;
        this.springs.ny[i] = (x1 - x2) / r12d;
    }

    for (let i = 0; i < this.numPoints; i++)
    {
        x1 = this.points.x[this.springs.spring1[i]];
        x2 = this.points.x[this.springs.spring2[i]];
        y1 = this.points.y[this.springs.spring1[i]];
        y2 = this.points.y[this.springs.spring2[i]];

        r12d = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

        volume += 0.5 * Math.abs(x1 - x2) * Math.abs(this.springs.nx[i]) * (r12d);
    }

    for (let i = 0; i < this.numPoints; i++)
    {
        x1 = this.points.x[this.springs.spring1[i]];
        x2 = this.points.x[this.springs.spring2[i]];
        y1 = this.points.y[this.springs.spring1[i]];
        y2 = this.points.y[this.springs.spring2[i]];

        r12d = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

        pressurev = r12d * this.pressure * (1.0 / volume);

        this.points.fx[this.springs.spring1[i]] += this.springs.nx[i] * pressurev;
        this.points.fy[this.springs.spring1[i]] += this.springs.ny[i] * pressurev;
        this.points.fx[this.springs.spring2[i]] += this.springs.nx[i] * pressurev;
        this.points.fy[this.springs.spring2[i]] += this.springs.ny[i] * pressurev;
    }
}



JellyObject.prototype.integrateHeun = function(){
    let drx, dry;

    let fxsaved = new Float64Array(this.numPoints);
    let fysaved = new Float64Array(this.numPoints);

    let vxsaved = new Float64Array(this.numPoints);
    let vysaved = new Float64Array(this.numPoints);

    for (let i = 0; i < this.numPoints; i++)
    {
        

        this.points.vx[i] -= this.points.vx[i] * this.NDF;
        this.points.vy[i] -= this.points.vy[i] * this.NDF;

        vxsaved[i] = this.points.vx[i];
        vysaved[i] = this.points.vy[i];

        fxsaved[i] = this.points.fx[i] ;
        fysaved[i] = this.points.fy[i] ;

        this.points.vx[i] += this.points.fx[i] / this.Mass * 0.02;
        drx = this.points.vx[i] * 0.02;

        this.points.x[i] += drx;

        this.points.vy[i] += this.points.fy[i] / this.Mass * 0.02;
        dry = this.points.vy[i] * 0.02;

        this.points.y[i] += dry;

    }
   




    this.accumulateForces();

    for (let i = 0; i < this.numPoints; i++)
    {
        this.points.vx[i] = vxsaved[i] + (this.points.fx[i] + fxsaved[i]) / this.Mass * 0.02 / 2;
        this.points.vx[i] = Math.min(this.MAX_SPEED, this.points.vx[i]);
        this.points.vx[i] = Math.max(-this.MAX_SPEED, this.points.vx[i]);
        drx = this.points.vx[i] * 0.02;

        this.points.x[i] += drx;

        this.points.vy[i] = vysaved[i] + (this.points.fy[i] + fysaved[i]) / this.Mass * 0.02 / 2;
        this.points.vy[i] = Math.min(this.MAX_SPEED, this.points.vy[i]);
        this.points.vy[i] = Math.max(-this.MAX_SPEED, this.points.vy[i]);
        dry = this.points.vy[i] * 0.02;

        this.points.y[i] += dry;
    }



}

/**
 * @param {Vector2} a
 * @param {Vector2} b
 * @param {Vector2} c
 */
JellyObject.prototype.square = function(a,b,c)
{
    return 0.5 * Math.abs((b.x - c.x) * (a.y - c.y) - (a.x - c.x)*(b.y - c.y));
}




JellyObject.prototype.GetMassCenter = function()
{
    let m = new Vector2(0, 0);
    for(let i = 0; i < this.mesh.vertexCount; ++i)
    {
        m.x += this.mesh.vertices[i].x;
        m.y += this.mesh.vertices[i].y;
    }

    m.x /= this.mesh.vertexCount;
    m.y /= this.mesh.vertexCount;

    let s = 0;
    let c = new Vector2(0, 0);

    for (let i = 0; i < this.mesh.vertexCount; ++i)
    {
        let s1 = this.square(m, this.mesh.vertices[i],this.mesh.vertices[(i + 1) % this.mesh.vertexCount]);
        c.x += s1 * (m.x + this.mesh.vertices[i].x + this.mesh.vertices[(i + 1) % this.mesh.vertexCount].x) / 3;
        c.y += s1 * (m.y + this.mesh.vertices[i].y + this.mesh.vertices[(i + 1) % this.mesh.vertexCount].y) / 3;
        s += s1;
    }
    c.x /= s;
    c.y /= s;
    return c;
}



JellyObject.prototype.handleCollisions = function(){
    for(let i = 0; i < this.numPoints; ++i){

        let dx = this.points.x[i]/Math.sqrt(this.points.x[i]*this.points.x[i] + this.points.y[i]*this.points.y[i]),
        dy = this.points.y[i]/Math.sqrt(this.points.x[i]*this.points.x[i] + this.points.y[i]*this.points.y[i]);

        let penetration = -1;
        if(this.points.x[i]*this.size.x + this.position.x <= 0){
            penetration = Math.abs(0 - (this.points.x[i]*this.size.x + this.position.x))/this.size.x;
            this.points.x[i] -= 1.01*penetration*dx;
            this.points.y[i] -= 1.01*penetration*dy;
            

            let v = new Vector2(this.points.vx[i],this.points.vy[i]);
            v.x -= dx*(dx*this.points.vx[i] + dy*this.points.vy[i]);
            v.y -= dy*(dx*this.points.vx[i] + dy*this.points.vy[i]);
            this.points.vx[i] = v.x;
            this.points.vy[i] = v.y;
        }
        if(this.points.y[i]*this.size.y + this.position.y <= 0){
            penetration = Math.max(penetration, Math.abs(0 - (this.points.y[i]*this.size.y + this.position.y))/this.size.y);
            this.points.x[i] -= 1.01*penetration*dx;
            this.points.y[i] -= 1.01*penetration*dy;

            let v = new Vector2(this.points.vx[i],this.points.vy[i]);
            v.x -= dx*(dx*this.points.vx[i] + dy*this.points.vy[i]);
            v.y -= dy*(dx*this.points.vx[i] + dy*this.points.vy[i]);
            this.points.vx[i] = v.x;
            this.points.vy[i] = v.y;
        }


        if(this.points.x[i]*this.size.x + this.position.x >= width - 0){
            penetration = Math.abs(width - 0 - (this.points.x[i]*this.size.x + this.position.x))/this.size.x;
            this.points.x[i] -= 1.01*penetration*dx;
            this.points.y[i] -= 1.01*penetration*dy;
            

            let v = new Vector2(this.points.vx[i],this.points.vy[i]);
            v.x -= dx*(dx*this.points.vx[i] + dy*this.points.vy[i]);
            v.y -= dy*(dx*this.points.vx[i] + dy*this.points.vy[i]);
            this.points.vx[i] = v.x;
            this.points.vy[i] = v.y;
        }

        if(this.points.y[i]*this.size.y + this.position.y >= height - 0){
            penetration = Math.max(penetration, Math.abs(height - 0 - (this.points.y[i]*this.size.y + this.position.y))/this.size.y);
            this.points.x[i] -= 1.01*penetration*dx;
            this.points.y[i] -= 1.01*penetration*dy;

            let v = new Vector2(this.points.vx[i],this.points.vy[i]);
            v.x -= dx*(dx*this.points.vx[i] + dy*this.points.vy[i]);
            v.y -= dy*(dx*this.points.vx[i] + dy*this.points.vy[i]);
            this.points.vx[i] = v.x;
            this.points.vy[i] = v.y;
        }

    }
}




JellyObject.prototype.idle = function(){
    
    this.accumulateForces();
    this.integrateHeun();
    
    this.handleCollisions();
    this.updateMesh();
    
    let m = this.GetMassCenter();
    for(let i = 0; i < this.numPoints; ++i){
        this.points.x[i] -= m.x;
        this.points.y[i] -= m.y;
    }
    this.position.x += m.x;
    this.position.y += m.y;
    this.updateMesh();
    
}

JellyObject.prototype.render = function(){
    this.mesh.draw(this.position,this.size,this.color);
}


