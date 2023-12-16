import { useEffect, useState } from 'react';
import { fetchImages } from 'api/fetchImages';
import { ImageGallery } from './Gallery/ImageGallery/ImageGallery';
import { Searchbar } from './SearchBar/SearchBar';
import { LoadMoreBtn } from './LoadMoreBtn/LoadMoreBtn';
import { Loader } from './Loader/Loader';
import { MyModal } from './Modal/Modal';
import toast, { Toaster } from 'react-hot-toast';
import { GlobalStyle } from './GlobalStyle';

const per_page = 12;

export const App = () => {
  const [dataImages, setDataImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [modalData, setModalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [availablePages, setAvailablePages] = useState(0);

  useEffect(() => {
    if (searchQuery.trim() === '') return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const initialImages = await fetchImages(searchQuery, page);
        const { hits, totalHits } = initialImages;

        if (hits.length > 0) {
          setDataImages(prevDataImages => [...prevDataImages, ...hits]);
          setAvailablePages(Math.ceil(totalHits / per_page));
          toast.success('Successfully found!');
        } else {
          toast.error(
            'Nothing found. Check the correctness of the search word.'
          );
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return;
  }, [searchQuery, page]);

  const handleFormSubmit = newQuery => {
    setSearchQuery(newQuery);
    setPage(1);
    setDataImages([]);
  };

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handleOpenModal = image => {
    const { largeImageURL, tags } = image;
    setModalData({ largeImageURL, tagImageAlt: tags });
  };

  const handleCloseModal = () => {
    setModalData(null);
  };

  return (
    <div>
      <Searchbar onFormSubmit={handleFormSubmit} />

      {isLoading && <Loader />}

      {error && <h1>{error.message}</h1>}

      {dataImages.length > 0 && (
        <ImageGallery dataImages={dataImages} onOpenModal={handleOpenModal} />
      )}

      {page !== availablePages && dataImages.length >= 11 && !error && (
        <LoadMoreBtn onLoadMore={handleLoadMore} />
      )}

      {modalData && (
        <MyModal onCloseModal={handleCloseModal}>
          <img src={modalData.largeImageURL} alt={modalData.tagImageAlt} />
        </MyModal>
      )}

      {error && (
        <b>Oops! Something went wrong! Please try reloading this page! 🥹</b>
      )}

      <GlobalStyle />
      <Toaster />
    </div>
  );
};
