<?php
namespace Backpack;

/**
 * MongoDB GridFS API
 *
 * @author Peter-Christoph Haider (Project Leader) et al.
 * @package Backpack
 * @version 1.1
 * @copyright Copyright (c) 2012-2014, Zeyon Technologies
 */
class GridfsAPI extends API {
	/**
	 * @var array An associative array mapping actions to their definitions.
	 *     Action format:    { <name> => [ <method>, <function>, <parameters> ] }
	 *       Methods:        POST, GET, REQUEST
	 *     Parameter format: [ <name>, <type>, <default> = '', <required> = true ]
	 *       Types:          int, float, bool, array, object, string
	 */
	public $actions = array(
		/*!
		 * @cmd list_buckets
		 * @method any
		 * @description Lists all GridFS Buckets
		 * @return {array}
		 * @demo
		 */
		'list_buckets' => array('ANY', 'list_buckets', array()),
		/*!
		 * @cmd show_bucket
		 * @method any
		 * @description Display the bucket details
		 * @param {string} bucket The GridFS bucket name
		 * @return {array}
		 * @demo
		 */
		'show_bucket' => array('ANY', 'show_bucket', array(
			array('bucket', 'string'),
		)),
		/*!
		 * @cmd list_files
		 * @method any
		 * @description Lists all documents of a collection
		 * @param {string} bucket The GridFS bucket name
		 * @param {string} query The selection query
		 * @return {array}
		 * @demo
		 */
		'list_files' => array('ANY', 'list_files', array(
			array('bucket', 'string'),
			array('query', 'array', array(), false),
			array('sort', 'array', false, false),
		)),
		/*!
		 * @cmd show_file
		 * @method any
		 * @description Displays the file details
		 * @param {string} bucket The GridFS bucket name
		 * @param {string} index* The document UID
		 * @return {array}
		 * @demo
		 */
		'show_file' => array('ANY', 'show_file', array(
			array('bucket', 'string'),
			array('index', 'string', false),
			array('history', 'string', false, false),
		)),
		/*!
		 * @cmd show_file
		 * @method any
		 * @description Get a document idenfiert (and check it's existence)
		 * @param {string} bucket The GridFS bucket name
		 * @param {string} index* The document UID
		 * @return {array}
		 * @demo
		 */
		'identify_file' => array('ANY', 'identify_file', array(
			array('bucket', 'string'),
			array('index', 'string', false)
		)),
		/*!
		 * @cmd preview_file
		 * @method any
		 * @description Previews a file image
		 * @param {string} bucket The GridFS bucket name
		 * @param {string} index* The document UID
		 * @return {array}
		 * @demo
		 */
		'preview_file' => array('ANY', 'preview_file', array(
			array('bucket', 'string'),
			array('index', 'string', false),
			array('size', 'integer', false, false),
		)),
		/*!
		 * @cmd download_file
		 * @method any
		 * @description Downloads a file
		 * @param {string} bucket* The GridFS bucket name
		 * @param {string} index*  The filename or ID
		 * @return {stream}
		 * @demo
		 */
		'download_file' => array('ANY', 'download_file', array(
			array('bucket', 'string'),
			array('index', 'string', false),
		)),
		/*!
		 * @cmd save_file
		 * @method post
		 * @description Uploads a new file
		 * @param {string} bucket*   The GridFS bucket name
		 * @param {file}   upload*   The uploaded file
		 * @param {array}  data      The file meta data (requires "identifier"; use "_tempid" for temporary file uploads)
		 * @return {bool}
		 * @demo
		 */
		'save_file' => array('POST', 'save_file', array(
			array('bucket', 'string'),
			array('data', 'array', array(), false),
			// $_FILE['upload']
		)),
		/*!
		 * @cmd remove_file
		 * @method any
		 * @description Removes a file
		 * @param {string} bucket* The GridFS bucket name
		 * @param {string} index*  The filename or ID
		 * @return {bool}
		 * @demo
		 */
		'remove_file' => array('ANY', 'remove_file', array(
			array('bucket', 'string'),
			array('index', 'string', false),
		)),
		/*!
		 * @cmd restore_file
		 * @method any
		 * @description Restore a file
		 * @param {string} bucket* The GridFS bucket name
		 * @param {string} index*  The filename or ID
		 * @return {bool}
		 * @demo
		 */
		'restore_file' => array('ANY', 'restore_file', array(
			array('bucket', 'string'),
			array('index', 'string', false),
		)),
		/*!
		 * @cmd upload_temp
		 * @method any
		 * @description Upload a file for caching/preview
		 * @param {file}   upload*   The uploaded file
		 * @return {string} The temp filename
		 * @demo
		 */
		'upload_temp' => array('ANY', 'upload_temp', array(
			// $_FILE['upload']
		)),
		/*!
		 * @cmd load_temp
		 * @method any
		 * @description Loads a cached file
		 * @param {string} index*  The temp filename
		 * @return {stream}
		 * @demo
		 */
		'load_temp' => array('ANY', 'load_temp', array(
			array('index', 'string', false),
		)),
		/*!
		 * @cmd restore_document
		 * @method any
		 * @description Restores a history entity of the document
		 * @param {string} collection* The collection name
		 * @param {string} index* The document UID
         * @param {string} historyidx The index of the history entrie
		 * @return {bool}
		 * @demo
		 */
		'restore_history' => array('ANY', 'restore_history', array(
			array('bucket', 'string', false),
			array('index', 'string', false),
			array('historyidx', 'string', false),
		)),
	);

	public $auth_exceptions = array();

	/**
	 * List all files in a directory
	 *
	 * @return array
	 */
	public function do_list_buckets() {
		$this->requireConnection();

		$list = array();

		return $list;
	}

	/**
	 * Displays the bucket details
	 *
	 * @param  string $strBucket  The bucket name
	 * @return string
	 */
	public function do_show_bucket($strBucket) {
        $this->requireConnection();

        return $this->app->showCollection($strBucket);
	}

	/**
	 * Lists all files
	 *
	 * @param  string $strBucket  The bucket name
	 * @param  array  $arrQuery   The MongoDB Query
	 * @see    http://docs.mongodb.org/manual/reference/operator/
	 * @return string
	 */
	public function do_list_files($strBucket, $arrQuery=array(), $arrSort=false) {
		$this->requireConnection();

		$grid = $this->app->mongoDb->getGridFS($strBucket);

        API::recStringBool2Bool($arrQuery);
        $saveQuery = [];
		if (isset($arrQuery['_deleted'])) {
            if ($arrQuery['_deleted'] )
                $saveQuery['_deleted'] = 1;
            else {
                $saveQuery['_deleted'] = array(
                    '$exists' => false
                );
            }
		}

		if (isset($arrQuery['field']) && isset($arrQuery['field']['name']) && isset($arrQuery['field']['value'])) {
            $saveQuery[$arrQuery['field']['name']] = new \MongoRegex('/.*'.preg_quote($arrQuery['field']['value']).'.*/i');
		}

        // by default exlude history
        $fields = array('_history' => 0);

        if ( !empty($arrQuery['group']) )
            $saveSort[$arrQuery['group']] = 1;

        $cursor = $grid->find($saveQuery, $fields);
        if ( $arrSort ) {
            foreach ( $arrSort as $key => $type )
                $saveSort[$key] = intval($type);

        }

		$list = array();
		foreach ($cursor as $elem) {
            $this->cleanMongoEntity($elem->file);
			$list[] = $elem->file;
		}

		return $list;
	}

	/**
	 * Displays the file meta info
	 *
	 * @param  string $strId  The file identifier or path
	 * @return array
	 */
	public function do_show_file($strBucket, $strId, $boolHistory=false) {
		$this->requireConnection();

        API::recStringBool2Bool($boolHistory);

        // by default exlude history
        $fields = array();
        if ( !$boolHistory )
            $fields = array('_history' => 0);

		$grid = $this->app->mongoDb->getGridFS($strBucket);
		$file = $grid->findOne(['$or' => [
			['_id'        => new \MongoId($strId)],
			['identifier' => $strId],
			['filename'   => $strId]
		]], $fields);

		if ($file == null)
			throw new \Exception('File not found: '.$strId);

        $this->cleanMongoEntity($file->file);

        if ( $boolHistory ) {
            if ( !isset($file->file['_history']) )
                $file->file['_history'] = [];

            $historyGrid = $this->app->mongoDb->getGridFS($strBucket.'.history');
            foreach ( $file->file['_history'] as &$hfileid ) {
                $hfileid = $historyGrid->findOne(array('_id' => new \MongoId($hfileid)));

                $this->cleanMongoEntity($hfileid->file);

                $hfileid->file['_historyid'] = $hfileid->file['_id'];
                $hfileid->file['_id'] = $file->file['_id'];

                $hfileid = $hfileid->file;
            }
        }

		return $file->file;
	}

	/**
	 * Get a file idenfiert (and check it's existence)
	 *
	 * @param  string $strBucket The bucket name
	 * @param  string $strId     The file ID
	 * @return array The document content
	 */
	public function do_identify_file($strBucket, $strId) {
		$this->requireConnection();

		if (!$file = $this->app->mongoDb->selectCollection($strBucket.'.files')->findOne(['_id' => new \MongoId($strId)], ['identifier']))
			throw new \Exception('File "' . $strId . '" not found!');

		return $this->cleanMongoEntity($file);
	}


	/**
	 * Download file
	 *
	 * @param  string $strBucket  The Bucket name
	 * @param  string $strId      The file identifier or path
	 * @return RESTvoidResult
	 */
	public function do_download_file($strBucket, $strId) {
		$this->requireConnection();

		$grid = $this->app->mongoDb->getGridFS($strBucket);

		$selector = [['identifier' => $strId]];
		if (strpos($strId, '.') === false) {
			$selector[] = ['_id' => new \MongoId($strId)];
		} else {
			$selector[] = ['filename' => $strId];
		}

		$file = $grid->findOne(['$or' => $selector]);

		if ($file == null)
			throw new \Exception('File not found: '.$strId);

		header('Content-type: '.\REST\getMimetypeByExtension(pathinfo($file->getFilename(), PATHINFO_BASENAME)));
		$stream = $file->getResource();
		while (!feof($stream))
			echo fread($stream, 8192);

		return new RESTvoidResult();
	}

	/**
	 * Upload file
	 *
	 * @param  string $strBucket  The Bucket name
	 * @param  string $strId      The file identifier, filename or
	 * @param  array  $arrMeta    Meta information
	 * @return string The file ID
	 */
	public function do_save_file($strBucket, $arrMeta) {
		$this->requireConnection();

        $settings = $this->app->showCollection($strBucket);

        if ( isset($settings['properties']) ) {
            // validate form data
			$locale = \Localizer::getInstance();
            $validator = new \REST\Validator($locale);

            $filter = $validator->fieldTypesToFilter($settings['properties']);

            $warnings = $validator->filterErrors($arrMeta, $this->initFilter($filter, $locale));

            if ( $warnings )
                return array('result' => array('validation' => false, 'warnings' => $warnings));
        }

		$grid = $this->app->mongoDb->getGridFS($strBucket);
		$historyGrid = $this->app->mongoDb->getGridFS($strBucket.'.history');

        $file = null;
        if ( isset($arrMeta['_id']) )
            $file = $grid->findOne(array('_id' => new \MongoId($arrMeta['_id'])));

        if ( isset($settings['index']) && isset($settings['properties']) ) {
            foreach ( $settings['index'] as $property => $order ) {
                if ( !isset($settings['properties'][$property]) )
                    throw new \Exception('You try to set index of not existing property: '.$property);

                $grid->ensureIndex(array($property => $order));
            }
        }

        $checkIdentifier = $arrMeta['identifier'];
		if ( $file != null && isset($arrMeta['identifier']) && $file->file['identifier'] == $arrMeta['identifier'] ) {
            $checkIdentifier = false;

        }

        if ( $checkIdentifier !== false ) {
            $exist = $grid->findOne(['identifier' => $arrMeta['identifier']]);

            if ( $exist ) {
                if ( $file == null ||
                    ($exist->file['identifier'] != $file->file['identifier']) )
                    throw new \Exception('Another file with the same identifier already exists!');
            }

        }

		if (isset($arrMeta['creationdate']))
			unset($arrMeta['creationdate']);
		if (isset($arrMeta['md5']))
			unset($arrMeta['md5']);

        API::recStringBool2Bool($arrMeta);

        if ( $file == null ) {
			$arrMeta['creationdate'] = new \MongoDate();
            $arrMeta['creator'] = $this->app->username;
            $arrMeta['_history'] = [];

        }

        $arrMeta['lastmodified'] = new \MongoDate();
        $arrMeta['modifier'] = $this->app->username;

        $fsfile = null;
		if (isset($arrMeta['_tempid']) || (isset($_FILES) && isset($_FILES['upload']))) {
			// prepare previously uploaded file

            if (!file_exists(CACHE_DIR.$arrMeta['_tempid']) || filesize(CACHE_DIR.$arrMeta['_tempid']) == 0)
                throw new \Exception('Could not read upload file: '.$arrMeta['_tempid']);


            $ext = pathinfo(CACHE_DIR.$arrMeta['_tempid'], PATHINFO_EXTENSION);
            $filename = strtolower($arrMeta['identifier']).($ext == '' ? '' : '.'.$ext);

            rename(CACHE_DIR.$arrMeta['_tempid'], CACHE_DIR.$filename);
            unset($arrMeta['_tempid']);

            $arrMeta['extension'] = $ext;
            $arrMeta['mimetype']  = \REST\getMimetypeByExtension($ext);

            $fsfile = CACHE_DIR.$filename;

        } else if ( isset($arrMeta['_historyid']) ) {
            // we are restoring a history entity

            $historyfile = $historyGrid->findOne(array('_id' => new \MongoId($arrMeta['_historyid'])));

            $ext = pathinfo($historyfile->file['filename'], PATHINFO_EXTENSION);
            $filename = strtolower($arrMeta['identifier']).($ext == '' ? '' : '.'.$ext);
            $fsfile = CACHE_DIR.$filename;

            file_put_contents($fsfile, $historyfile->getBytes());

            unset($arrMeta['_historyid']);

            $arrMeta['extension'] = $ext;
            $arrMeta['mimetype']  = \REST\getMimetypeByExtension($ext);
        }

        // new entry
        if ( $file == null ) {
            if ( $fsfile == null )
                throw new \Exception('You have to upload file.');

            $id = $grid->put($fsfile, $arrMeta);
            unlink(CACHE_DIR.$filename);

            return $id->__toString();

        }

        // save history
        if ( !isset($file->file['_history']) )
            $file->file['_history'] = [];

        $hfile = $file->file;
        unset($hfile['_id'], $hfile['_history']);
        $historyId = $historyGrid->storeBytes($file->getBytes(), $hfile);

        $arrMeta['_history'] = $file->file['_history'];
        array_unshift($arrMeta['_history'], $historyId);

        if ( !isset($this->app->config['historylength']) )
            throw new \Exception('You have to define a max histroy length in the settings!');

        if ( count($arrMeta['_history']) > $this->app->config['historylength'] ) {
            $lastid = array_pop($arrMeta['_history']);
            $historyGrid->delete(new \MongoId($lastid));
        }

        // update file
        $id = $arrMeta['_id'];
        if ( $fsfile != null ) {
			$grid->delete(new \MongoId($id));

            $arrMeta['_id'] = new \MongoId($id);
            $grid->put($fsfile, $arrMeta);
            unlink(CACHE_DIR.$filename);
		} else {
			unset($arrMeta['_id']);
			$grid->update(['_id' => new \MongoId($id)], ['$set' => $arrMeta]);
		}

        return $id;
	}

	/**
	 * Removes a file
	 *
	 * @param  string $strBucket  The Bucket name
	 * @param  string $strId      The file identifier or path
	 * @return bool
	 */
	public function do_remove_file($strBucket, $strId) {
		$this->requireConnection();

		$grid = $this->app->mongoDb->getGridFS($strBucket);
		$file = $grid->findOne(['$or' => [
			['_id'        => new \MongoId($strId)],
			['identifier' => $strId],
			['filename'   => $strId]
		]]);
		if ($file == null)
			throw new Exception('File not found: '.$strId);

		if (isset($file->file['_deleted'])) {
            if (isset($file->file['_history'])) {
                $historyGrid = $this->app->mongoDb->getGridFS($strBucket.'.history');
                foreach ( $file->file['_history'] as $hid ) {
                    $historyGrid->delete($hid);
                }
            }
            return $grid->delete($file->file['_id']);
		}

		$grid->update(['_id' => $file->file['_id']], ['$set' => ['_deleted' => 1]]);

		return true;
	}

	/**
	 * Restore a deleted file from the collection
	 *
	 * @param  string $strCollection The collection name
	 * @param  string $strId         The document ID
	 * @return bool
	 */
	public function do_restore_file($strBucket, $strId) {
		$this->requireConnection();

		$grid = $this->app->mongoDb->getGridFS($strBucket);

		if (!$file = $grid->findOne([
                '_id' => new \MongoId($strId),
                '_deleted' => 1
            ], ['_id', 'identifier']))
			throw new Exception('Deleted file not found!');

        $found = $grid->findOne(array(
            'identifier' => $file->file['identifier'],
            '_deleted' => array(
                '$exists' => false
            )
        ));
        if ( $found != null )
            throw new \Exception('Can not restore because document identifier already exists!');

        // important: completely delete "_deleted" field and NOT set it to 0
		$grid->update(['_id' => $file->file['_id']], ['$unset' => ['_deleted' => ""]]);
	}

	/**
	 * Returns a preview image of the requested file
	 *
	 * @param  string $strBucket  The Bucket name
	 * @param  string $strId      The file identifier or path
	 * @param  int    $intSize
	 * @return RESTvoidResult
	 */
	public function do_preview_file($strBucket, $strId, $intSize = 0) {
		$this->requireConnection();

		$grid = $this->app->mongoDb->getGridFS($strBucket);
		$file = $grid->findOne(['$or' => [
			['_id'        => new \MongoId($strId)],
			['identifier' => $strId],
			['filename'   => $strId]
		]]);
		if ($file == null)
			throw new \Exception('File not found: '.$strId);

		$ext = isset($file->file['extension']) ? $file->file['extension'] : pathinfo($file->getFilename(), PATHINFO_EXTENSION);

		try {
			if (!in_array($ext, ['jpg', 'jpeg', 'gif', 'png']))
				throw new \Exception('Not an image');

			if ($intSize) {
				$tempfile = 'T'.$intSize.$file->file['md5'].'.'.$ext;
				if (!file_exists(CACHE_DIR.'T'.$tempfile)) {
					if (class_exists('Imagick')) {
						$file->write(CACHE_DIR.$tempfile);
						$thumb = new \Imagick();
						$thumb->readImage(CACHE_DIR . $tempfile);
						$thumb->resizeImage($intSize, $intSize, \Imagick::FILTER_POINT, 1, true);
						$thumb->writeImage(CACHE_DIR . $tempfile);
						$thumb->clear();
						$thumb->destroy();
					} elseif (defined('IMAGEMAGIC_CONVERT')) {
						$file->write(CACHE_DIR.$tempfile);
						exec(IMAGEMAGIC_CONVERT.' '.CACHE_DIR.$tempfile.' -resize '.$intSize.'x'.$intSize.' '.CACHE_DIR.$tempfile);
					} else {
						throw new \Exception('No resizing option available');
					}
				}
				header('Content-Type: '.\REST\getMimetypeByExtension($ext));
				header('Content-Disposition: inline; filename="'.$tempfile.'"');
				echo file_get_contents(CACHE_DIR.$tempfile);
			} else {
				//header('Content-Type: '.getMimetypeByExtension($ext));
				header('Content-Type: '.\REST\getMimetypeByExtension($ext));
				echo $file->getBytes();
			}
		} catch(\Exception $e) {
			header('Content-Type: image/png');
			header('Content-Disposition: inline; filename="placeholder.png"');
			echo file_get_contents(BASE_DIR.DIRECTORY_SEPARATOR.'assets'.DIRECTORY_SEPARATOR.'img'.DIRECTORY_SEPARATOR.'placeholder.png');
		}

		return new \REST\voidResult();
	}

	/**
	 * Upload a temp file
	 *
	 * @return string
	 */
	public function do_upload_temp() {
		try {
			$this->requireConnection();
			if ( !isset($_FILES) || !isset($_FILES['upload']) || filesize($_FILES['upload']['tmp_name']) == 0 || $_FILES['upload']['error'] != 0 ) {
                if ( $_FILES['upload']['error'] != 0 )
                    throw new \Exception('Upload error nr.: '.$_FILES['upload']['error']);

				throw new \Exception('Missing uploaded file');
			}

			$ext = pathinfo($_FILES['upload']['name'], PATHINFO_EXTENSION);
			// $id  = md5($_FILES['upload']['tmp_name']).($ext ==  '' ? '' : '.'.$ext);
			$id = md5_file($_FILES['upload']['tmp_name']).($ext ==  '' ? '' : '.'.$ext);

			copy($_FILES['upload']['tmp_name'], CACHE_DIR.$id);

			$res = array('result' => $id);
		} catch (Exception $e) {
			$res = array(
				'error' => $e->getMessage(),
				'trace' => $e->getTraceAsString()
			);
		}

		header('Content-type: text/plain; charset=UTF-8');
		echo 'guhdruigbhnditughnnfuidbvbhdf'.json_encode($res).'JGBIGBUIGIUGUIGIZUFUZFUKZ';
		return new \REST\voidResult();
	}

	/**
	 * Upload a temp file
	 *
	 * @return string
	 */
	public function do_load_temp($strId) {
		$this->requireConnection();

		if (!file_exists(CACHE_DIR.$strId) || filesize(CACHE_DIR.$strId) == 0)
			throw new \Exception('Could not read temp file!');

		header('Content-Type: '.\REST\getMimetypeByExtension(pathinfo(CACHE_DIR.$strId, PATHINFO_EXTENSION)));
		header('Content-Disposition: inline; filename="'.$strId.'"');
		header('Content-Length: '.filesize(CACHE_DIR.$strId));
		echo file_get_contents(CACHE_DIR.$strId);
		return new \REST\voidResult();
	}

	/**
	 * Restore a history entity of the document from the collection
	 *
	 * @param  string $strCollection The collection name
	 * @param  string $strId         The document ID
	 * @param  string $intHistoryIdx The index of the history entrie
	 * @return bool
	 */
	public function do_restore_history($strBucket, $strId, $intHistoryIdx) {
		$this->requireConnection();

		$grid = $this->app->mongoDb->getGridFS($strBucket);
		$historyGrid = $this->app->mongoDb->getGridFS($strBucket.'.history');

		if (!$file = $grid->findOne([
                '_id' => new \MongoId($strId),
                '_deleted' => array(
                    '$exists' => false
                )
            ]))
			throw new \Exception('File history entity not found!');

        if ( !isset($file->file['_history'][$intHistoryIdx]) )
            throw new \Exception('File history entity not found!');

        $hentity = $file->file['_history'][$intHistoryIdx];
        $hentity = $historyGrid->findOne(array('_id' => new \MongoId($hentity)));
        if ( !$hentity )
            throw new \Exception('File history entity not found!');

        if ( $hentity->file['identifier'] != $file->file['identifier'] ) {
            $found = $grid->findOne(array(
                'identifier' => $hentity->file['identifier'],
                '_deleted' => array(
                    '$exists' => false
                )
            ));
            if ( $found != null )
                throw new \Exception('Can not restore because document identifier already exists!');
        }

        $hentitymeta = $hentity->file;
        $hentitymeta['_id'] = $file->file['_id'];
        $hentitymeta['_history'] = $file->file['_history'];

        $filemeta = $file->file;
        unset($filemeta['_id']);
        unset($filemeta['_history']);

        $hid = $historyGrid->storeBytes($file->getBytes(), $filemeta);
        array_unshift($hentitymeta['_history'], $hid);

        if ( !isset($this->app->config['historylength']) )
            throw new \Exception('You have to define a max histroy length in the settings!');

        if ( count($hentitymeta['_history']) > $this->app->config['historylength'] ) {
            $lastid = array_pop($hentitymeta['_history']);
            $historyGrid->delete($lastid);
        }

        $hentitymeta['lastmodified'] = new \MongoDate();
        $hentitymeta['modifier'] = $this->app->username;

		$grid->delete($hentitymeta['_id']);
        $grid->storeBytes($hentity->getBytes(), $hentitymeta);

        return true;
	}
}

?>
