import React, { Component } from 'react'

class ScrollWatch extends Component{

    isBottom(el) {
        return el.getBoundingClientRect().bottom <= window.innerHeight;
    }
      
    onScroll = e => {
        console.log(e)
        const wrappedElement = document.getElementById('header');
        if (this.isBottom(wrappedElement)) {
          console.log('header bottom reached');
          document.removeEventListener('scroll', this.trackScrolling);
        }
    };

    render(){
        return(
            <div onScroll={this.onScroll}>
                { this.props.children }
            </div>
        )
    }
}

export default ScrollWatch