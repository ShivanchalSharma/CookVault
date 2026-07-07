import view from './view.js'
import previewview from './previewview.js'
import {icons} from 'url:../../img/icons.svg' 

class ResultsView extends view{
    _parentElement = document.querySelector('.results')
    _errorMessage = `We could not find any results for that dish! Please try another.`
    _message = ''

    _generateMarkup(){
        return this._data.map(bookmark=>previewview.render(bookmark,false)).join('')
    }
}

export default new ResultsView()