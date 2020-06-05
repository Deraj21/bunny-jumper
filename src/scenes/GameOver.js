import Phaser from '../lib/phaser.js'

export default class GameOver extends Phaser.Scene {
  constructor(){
    super('game-over')
  }

  create(){
    const width = this.scale.width
    const height = this.scale.height
    const style = {
      fontSize: 48
    }

    this.add.text(width/2, height/2, 'Game Over', style)
      .setOrigin(.5)

    // listen for spacebar down
    this.input.keyboard.once('keydown_SPACE', () => {
      this.scene.start('game')
    })
  }
  
}
