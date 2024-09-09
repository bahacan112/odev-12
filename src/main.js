import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'iziToast/dist/css/iziToast.min.css';
import iziToast from 'izitoast';
class ImageGallery {
  constructor(searchInput, searchButton, gallery, loadingSpinner, loadMoreButton) {
    this.searchInput = searchInput;
    this.searchButton = searchButton;
    this.gallery = gallery;
    this.loadingSpinner = loadingSpinner;
    this.loadMoreButton = loadMoreButton;
    this.currentPage = 1;
    this.currentQuery = '';
    this.lightbox = new SimpleLightbox('.gallery a', {
      captions: true,
      captionsData: 'alt',
      captionDelay: 250
    });

    this.initialize();
  }

  initialize() {
    this.loadMoreButton.classList.add('hidden')
    this.searchButton.addEventListener('click', this.handleSearch.bind(this));
    this.loadMoreButton.addEventListener('click', this.loadMoreImages.bind(this));
  }

  async handleSearch() {
    this.currentQuery = this.searchInput.value;
    this.currentPage = 1;
    this.gallery.innerHTML = ''; 
    await this.fetchImages(); 
  }

  async loadMoreImages() {
    this.currentPage++; 

    await this.fetchImages(); 
    this.scrollGallery();
  }
  scrollGallery() {
    const galleryItems = this.gallery.querySelectorAll('.gallery-item');
    if (galleryItems.length > 1) {
      const itemHeight = galleryItems[0].getBoundingClientRect().height;
      window.scrollBy({ top: itemHeight * 2, behavior: 'smooth' });
    }
  }
  async fetchImages() {
    const url = `https://pixabay.com/api/?key=45876667-2d0330e34270c14d815b5249b&q=${this.currentQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${this.currentPage}&page_per=40`;

    this.loadingSpinner.classList.remove('hidden');
    this.loadMoreButton.classList.remove('hidden')
    try {
      const response = await axios.get(url);
      const data = response.data;
      console.log(data)
      const galleryItems = data.hits
      .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
        return `
          <li class="gallery-item">
            <a href="${largeImageURL}" data-lightbox="gallery" data-title="${tags}">
              <img class="gallery-image" src="${webformatURL}" alt="${tags}"/>
            </a>
            <div class="bottom-item">
              <div class="bottom-item-div"><p class="bottom-item-p1">Likes</p><p class="bottom-item-p2">${likes}</p></div>
              <div class="bottom-item-div"><p class="bottom-item-p1">Views</p><p class="bottom-item-p2">${views}</p></div>
              <div class="bottom-item-div"><p class="bottom-item-p1">Comments</p><p class="bottom-item-p2">${comments}</p></div>
              <div class="bottom-item-div"><p class="bottom-item-p1">Downloads</p><p class="bottom-item-p2">${downloads}</p></div>
            </div>
          </li>
        `;
      })
      .join("");
      this.gallery.innerHTML += galleryItems;

     
      if (data.hits.length===0) {
        iziToast.info({
          title: 'Info',
          message: 'Sorry, there are no images matching your search query. Please try again!',
          position: 'topRight',
          backgroundColor: 'red',
        });
        this.loadingSpinner.classList.add('hidden');
        this.loadMoreButton.classList.add('hidden')
        return;
      }
console.log(data.totalHits-(this.currentPage*40))

      if (data.totalHits-(this.currentPage*40) < 40 && this.currentPage >= 1) {
        this.loadMoreButton.classList.add('hidden'); 
        this.loadingSpinner.classList.add('hidden');

        iziToast.info({
          title: 'Info',
          message: `We're sorry, but you've reached the end of search results`,
          position: 'topRight',
          backgroundColor: 'yellow',
        });
        return;
      }


      this.loadMoreButton.classList.remove()
      this.lightbox.refresh(); 
    } catch (error) {
      console.error('Hata:', error);
    } finally {
      this.loadingSpinner.classList.add('hidden'); 
    }
  }
}

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const gallery = document.getElementById('gallery');
const loadingSpinner = document.getElementById('loading-spinner');
const loadMoreButton = document.getElementById('load-more-button');

const imageGallery = new ImageGallery(searchInput, searchButton, gallery, loadingSpinner, loadMoreButton);
